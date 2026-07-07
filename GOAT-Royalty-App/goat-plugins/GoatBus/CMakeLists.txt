cmake_minimum_required(VERSION 3.22)
project(GoatBus VERSION 1.0.0)
set(CMAKE_CXX_STANDARD 17)

if(DEFINED ENV{JUCE_PATH}) set(JUCE_PATH $ENV{JUCE_PATH}) else() set(JUCE_PATH "$ENV{HOME}/JUCE") endif()
add_subdirectory(${JUCE_PATH} JUCE)

if(NOT DEFINED AAX_SDK_PATH AND DEFINED ENV{AAX_SDK_PATH}) set(AAX_SDK_PATH $ENV{AAX_SDK_PATH}) endif()
juce_set_aax_sdk_path(${AAX_SDK_PATH})

juce_add_plugin(GoatBus
    COMPANY_NAME              "GOAT Force"
    PLUGIN_MANUFACTURER_CODE  GOAT
    PLUGIN_CODE               GBUS
    FORMATS                   AAX VST3 AU Standalone
    PRODUCT_NAME              "GOAT Bus"
    BUNDLE_ID                 com.goatforce.goatbus
    AAX_IDENTIFIER            com.goatforce.goatbus
    AAX_CATEGORY              AAX_ePlugInCategory_Dynamics
    COPY_PLUGIN_AFTER_BUILD   TRUE
)
target_sources(GoatBus PRIVATE Source/PluginProcessor.cpp Source/PluginProcessor.h)
target_include_directories(GoatBus PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/../Common)
target_compile_definitions(GoatBus PUBLIC JUCE_WEB_BROWSER=0 JUCE_USE_CURL=0)
target_link_libraries(GoatBus PRIVATE juce::juce_audio_utils juce::juce_dsp
    juce::juce_recommended_config_flags juce::juce_recommended_warning_flags)