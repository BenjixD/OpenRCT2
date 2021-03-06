cmake_minimum_required(VERSION 2.6)

option(DISABLE_RCT2_TESTS "Disable tests that require RollerCoaster Tycoon 2 assets.")
option(SYSTEM_GTEST "Use the googletest library provided by the system.")

if (SYSTEM_GTEST)
    find_package(GTest REQUIRED)

    set(GTEST_LIBRARIES ${GTEST_BOTH_LIBRARIES})

    message(WARNING "Gtest strongly advices against using a system installation, see https://github.com/google/googletest/blob/master/googletest/docs/FAQ.md#why-is-it-not-recommended-to-install-a-pre-compiled-copy-of-google-test-for-example-into-usrlocal for detailed information. If errors occur please double-check without the SYSTEM_GTEST flag.")
else (SYSTEM_GTEST)

        # Bootstrap GoogleTest
        INCLUDE(ExternalProject)

        # Use googletest with https://github.com/google/googletest/pull/1045 applied
        ExternalProject_Add(
                googletest-distribution
                URL https://github.com/google/googletest/archive/ad49eaa0466b98f21449efaaaae817683daa8b99.tar.gz
                URL_HASH SHA1=e468bfdffe7c46c14ce06bfb48a29b6201908504
                TIMEOUT 10
                CONFIGURE_COMMAND ""
                BUILD_COMMAND ""
                INSTALL_COMMAND ""
        )

        # Specify include dir
        ExternalProject_Get_Property(googletest-distribution SOURCE_DIR)
        set(GOOGLETEST_DISTRIB_SOURCE_DIR "${SOURCE_DIR}")

        ExternalProject_Add(
                googletest
                DEPENDS googletest-distribution
                DOWNLOAD_COMMAND ""
                SOURCE_DIR "${GOOGLETEST_DISTRIB_SOURCE_DIR}/googletest"
                CMAKE_ARGS "-DCMAKE_CXX_FLAGS=${TARGET_M}"
                BUILD_BYPRODUCTS "googletest-prefix/src/googletest-build/${CMAKE_STATIC_LIBRARY_PREFIX}gtest${CMAKE_STATIC_LIBRARY_SUFFIX}"
                BUILD_BYPRODUCTS "googletest-prefix/src/googletest-build/${CMAKE_STATIC_LIBRARY_PREFIX}gtest_main${CMAKE_STATIC_LIBRARY_SUFFIX}"
                # Disable install step
                INSTALL_COMMAND ""
                # Wrap download, configure and build steps in a script to log output
                LOG_DOWNLOAD ON
                LOG_CONFIGURE ON
                LOG_BUILD ON)


        # Specify include dir
        set(GTEST_INCLUDE_DIRS ${GOOGLETEST_DISTRIB_SOURCE_DIR}/googletest/include)

        # Library
        ExternalProject_Get_Property(googletest BINARY_DIR)
        set(GOOGLETEST_BINARY_DIR "${BINARY_DIR}")
        set(GTEST_LIBRARY_PATH ${GOOGLETEST_BINARY_DIR}/${CMAKE_STATIC_LIBRARY_PREFIX}gtest${CMAKE_STATIC_LIBRARY_SUFFIX})
        set(GTEST_MAIN_LIBRARY_PATH ${GOOGLETEST_BINARY_DIR}/${CMAKE_STATIC_LIBRARY_PREFIX}gtest_main${CMAKE_STATIC_LIBRARY_SUFFIX})
        set(GTEST_LIBRARY gtest)
        set(GTEST_MAIN_LIBRARY gtest_main)
        add_library(${GTEST_LIBRARY} STATIC IMPORTED)
        add_library(${GTEST_MAIN_LIBRARY} STATIC IMPORTED)
        set_property(TARGET ${GTEST_LIBRARY} PROPERTY IMPORTED_LOCATION ${GTEST_LIBRARY_PATH})
        set_property(TARGET ${GTEST_MAIN_LIBRARY} PROPERTY IMPORTED_LOCATION ${GTEST_MAIN_LIBRARY_PATH})
        add_dependencies(${GTEST_LIBRARY} googletest)
        add_dependencies(${GTEST_MAIN_LIBRARY} ${GTEST_LIBRARY})

        set(GTEST_LIBRARIES gtest gtest_main pthread)

endif (SYSTEM_GTEST)

include_directories(SYSTEM ${GTEST_INCLUDE_DIRS})
include_directories("${ROOT_DIR}/src")
include_directories(${SDL2_INCLUDE_DIRS})

# Some most common files required in tests
set(COMMON_TEST_SOURCES
    "${ROOT_DIR}/src/openrct2/core/Console.cpp"
    "${ROOT_DIR}/src/openrct2/core/Diagnostics.cpp"
    "${ROOT_DIR}/src/openrct2/core/Guard.cpp"
    "${ROOT_DIR}/src/openrct2/core/String.cpp"
    "${ROOT_DIR}/src/openrct2/Diagnostic.cpp"
    "${ROOT_DIR}/src/openrct2/localisation/FormatCodes.cpp"
    "${ROOT_DIR}/src/openrct2/localisation/UTF8.cpp"
    "${ROOT_DIR}/src/openrct2/util/Util.cpp"
    "${ROOT_DIR}/src/openrct2/Version.cpp"
    )

# Create a re-usable library to save some compilation time
add_library(test-common STATIC ${COMMON_TEST_SOURCES})

# Setup testdata. It should be fine here, as the only way to reach here is by explicitly requesting tests.
if (NOT "z$ENV{CI}" STREQUAL "z")
    message("Detected CI environment. Disabling ride rating test.")
    set(DISABLE_RCT2_TESTS ON)
endif ()

if (NOT DISABLE_RCT2_TESTS)
    execute_process(COMMAND ${CMAKE_COMMAND} -E create_symlink "${CMAKE_CURRENT_LIST_DIR}/testdata" "${CMAKE_CURRENT_BINARY_DIR}/testdata")
endif ()

# Start of our tests

# sawyercoding test

set(SAWYERCODING_TEST_SOURCES
        "${CMAKE_CURRENT_LIST_DIR}/sawyercoding_test.cpp"
        "${ROOT_DIR}/src/openrct2/core/IStream.cpp"
        "${ROOT_DIR}/src/openrct2/core/MemoryStream.cpp"
        "${ROOT_DIR}/src/openrct2/rct12/SawyerChunk.cpp"
        "${ROOT_DIR}/src/openrct2/rct12/SawyerChunkReader.cpp"
        "${ROOT_DIR}/src/openrct2/util/SawyerCoding.cpp"
        )
add_executable(test_sawyercoding ${SAWYERCODING_TEST_SOURCES})
target_link_libraries(test_sawyercoding ${GTEST_LIBRARIES} test-common ${LDL} z)
add_test(NAME sawyercoding COMMAND test_sawyercoding)

# LanguagePack test
set(LANGUAGEPACK_TEST_SOURCES
        "${CMAKE_CURRENT_LIST_DIR}/LanguagePackTest.cpp"
        "${ROOT_DIR}/src/openrct2/localisation/LanguagePack.cpp"
        )
add_executable(test_languagepack ${LANGUAGEPACK_TEST_SOURCES})
if (UNIX AND NOT ${CMAKE_SYSTEM_NAME} MATCHES "BSD")
    # Include libdl for dlopen
    set(LDL dl)
endif ()
target_link_libraries(test_languagepack ${GTEST_LIBRARIES} test-common ${LDL} z)
add_test(NAME languagepack COMMAND test_languagepack)

# INI test
set(INI_TEST_SOURCES
        "${CMAKE_CURRENT_LIST_DIR}/IniWriterTest.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/IniReaderTest.cpp"
        "${ROOT_DIR}/src/openrct2/config/IniReader.cpp"
        "${ROOT_DIR}/src/openrct2/config/IniWriter.cpp"
        "${ROOT_DIR}/src/openrct2/core/IStream.cpp"
        "${ROOT_DIR}/src/openrct2/core/MemoryStream.cpp"
        )
add_executable(test_ini ${INI_TEST_SOURCES})
target_link_libraries(test_ini ${GTEST_LIBRARIES} test-common ${LDL} z)
add_test(NAME ini COMMAND test_ini)

# String test
set(STRING_TEST_SOURCES
        "${CMAKE_CURRENT_LIST_DIR}/StringTest.cpp"
        )
add_executable(test_string ${STRING_TEST_SOURCES})
target_link_libraries(test_string ${GTEST_LIBRARIES} test-common ${LDL} z)
add_test(NAME string COMMAND test_string)


# Ride ratings test
set(RIDE_RATINGS_TEST_SOURCES "${CMAKE_CURRENT_LIST_DIR}/RideRatings.cpp"
                              "${CMAKE_CURRENT_LIST_DIR}/TestData.cpp")
add_executable(test_ride_ratings ${RIDE_RATINGS_TEST_SOURCES})
target_link_libraries(test_ride_ratings ${GTEST_LIBRARIES} libopenrct2 ${LDL} z)

# Multi-launch test
set(MULTILAUNCH_TEST_SOURCES "${CMAKE_CURRENT_LIST_DIR}/MultiLaunch.cpp"
                             "${CMAKE_CURRENT_LIST_DIR}/TestData.cpp")
add_executable(test_multilaunch ${MULTILAUNCH_TEST_SOURCES})
target_link_libraries(test_multilaunch ${GTEST_LIBRARIES} libopenrct2 ${LDL} z)
    
if (NOT DISABLE_RCT2_TESTS)
    add_test(NAME ride_ratings COMMAND test_ride_ratings)
    add_test(NAME multilaunch COMMAND test_multilaunch)
endif ()
