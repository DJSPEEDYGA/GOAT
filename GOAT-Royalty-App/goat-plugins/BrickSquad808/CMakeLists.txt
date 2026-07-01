cmake_minimum_required(VERSION 3.22)
project(BrickSquad808 VERSION 1.0.0)
set(CMAKE_CXX_STANDARD 17)

if(DEFINED ENV{JUCE_PATH})
    set(JUCE_PATH $ENV{JUCE_PATH})
else()
    set(JUCE_PATH "$ENV{HOME}/JUCE")
endif()
add_subdirectory(${JUCE_PATH} JUCE)

if(NOT DEFINED AAX_SDK_PATH AND DEFINED ENV{AAX_SDK_PATH})
    set(AAX_SDK_PATH $ENV{AAX_SDK_PATH})
endif()
juce_set_aax_sdk_path(${AAX_SDK_PATH})

juce_add_plugin(BrickSquad808
    COMPANY_NAME              "GOAT Force"
    PLUGIN_MANUFACTURER_CODE  GOAT
    PLUGIN_CODE               G808
    FORMATS                   AAX VST3 AU Standalone
    PRODUCT_NAME              "BrickSquad 808"
    BUNDLE_ID                 com.goatforce.bricksquad808
    AAX_IDENTIFIER            com.goatforce.bricksquad808
    AAX_CATEGORY              AAX_ePlugInCategory_Harmonic
    COPY_PLUGIN_AFTER_BUILD   TRUE
)

target_sources(BrickSquad808 PRIVATE
    Source/PluginProcessor.cpp
    Source/PluginProcessor.h
    Source/PluginEditor.cpp
    Source/PluginEditor.h
)
target_include_directories(BrickSquad808 PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/../Common)
target_compile_definitions(BrickSquad808 PUBLIC JUCE_WEB_BROWSER=0 JUCE_USE_CURL=0)
target_link_libraries(BrickSquad808 PRIVATE
    juce::juce_audio_utils juce::juce_dsp
    juce::juce_recommended_config_flags
    juce::juce_recommended_warning_flags)