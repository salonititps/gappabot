cmake_minimum_required(VERSION 3.22.1)

project(vulkan_renderer)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find required libraries
find_library(log-lib log)
find_library(android-lib android)
find_library(vulkan-lib vulkan)

# Add GLM include directory
include_directories(${CMAKE_SOURCE_DIR}/glm)

# Add source files
add_library(vulkan_renderer SHARED
    VulkanRenderer.cpp
)

target_include_directories(vulkan_renderer PRIVATE
    ${CMAKE_SOURCE_DIR}
)

target_link_libraries(vulkan_renderer
    ${log-lib}
    ${android-lib}
    ${vulkan-lib}
)