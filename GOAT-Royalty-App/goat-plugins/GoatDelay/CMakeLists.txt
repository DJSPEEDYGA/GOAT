cmake_minimum_required(VERSION 3.22)
project(GoatDelay VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

if(DEFINED ENV{JUCE_PATH})
    set(JUCE_PATH $ENV{JUCE_PATH})
else()
    set(JUCE_PATH "$ENV{HOME}/JUCE")
endif()
add_subdirectory(${JUCE_PATH} JUCE)

if(NOT DEFINED AAX_SDK_PATH)
    if(DEFINED ENV{AAX_SDK_PATH})
        set(AAX_SDK_PATH $ENV{AAX_SDK_PATH})
    else()
        message(FATAL_ERROR "AAX_SDK_PATH not defined. Set via -DAAX_SDK_PATH=/path/to/AAX_SDK_2.9.0")
    endif()
endif()
juce_set_aax_sdk_path(${AAX_SDK_PATH})

juce_add_plugin(GoatDelay
    COMPANY_NAME              "GOAT Force"
    COMPANY_WEBSITE           "https://goatroyalty.app"
    COMPANY_EMAIL             "speedy@brksquad.com"
    PLUGIN_MANUFACTURER_CODE  GOAT
    PLUGIN_CODE               GDLY
    FORMATS                   AAX VST3 AU Standalone
    PRODUCT_NAME              "GoatDelay"
    BUNDLE_ID                 com.goatforce.goatdelay
    DESCRIPTION               "Tempo-synced stereo delay"
    AAX_IDENTIFIER            com.goatforce.goatdelay
    AAX_CATEGORY              AAX_ePlugInCategory_Delay
    IS_SYNTH                  FALSE
    NEEDS_MIDI_INPUT          FALSE
    NEEDS_MIDI_OUTPUT         FALSE
    IS_MIDI_EFFECT            FALSE
    EDITOR_WANTS_KEYBOARD_FOCUS FALSE
    COPY_PLUGIN_AFTER_BUILD   TRUE
)

target_sources(GoatDelay PRIVATE
    Source/PluginProcessor.cpp
    Source/PluginProcessor.h
)

target_include_directories(GoatDelay PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/../Common
)

target_compile_definitions(GoatDelay PUBLIC
    JUCE_WEB_BROWSER=0
    JUCE_USE_CURL=0
    JUCE_VST3_CAN_REPLACE_VST2=0
)

target_link_libraries(GoatDelay PRIVATE
    juce::juce_audio_utils
    juce::juce_dsp
    juce::juce_recommended_config_flags
    juce::juce_recommended_lto_flags
    juce::juce_recommended_warning_flags
)
