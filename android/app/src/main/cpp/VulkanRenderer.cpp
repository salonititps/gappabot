#include <jni.h>
#include <android/log.h>
#include <android/native_window_jni.h>

#define VK_USE_PLATFORM_ANDROID_KHR
#include <vulkan/vulkan.h>
#include <vulkan/vulkan_android.h>

#define GLM_FORCE_RADIANS
#define GLM_FORCE_DEPTH_ZERO_TO_ONE
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>

#include <vector>
#include <array>
#include <cstring>
#include <algorithm>

#define LOG_TAG "VulkanRenderer"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

// Embedded SPIR-V shader bytecode
static const uint32_t vertShaderCode[] = {
    0x07230203,0x00010000,0x00080007,0x0000002c,0x00000000,0x00020011,0x00000001,0x0006000b,
    0x00000001,0x4c534c47,0x6474732e,0x3035342e,0x00000000,0x0003000e,0x00000000,0x00000001,
    0x0008000f,0x00000000,0x00000004,0x6e69616d,0x00000000,0x00000009,0x0000000d,0x00000016,
    0x00030003,0x00000002,0x000001c2,0x00040005,0x00000004,0x6e69616d,0x00000000,0x00050005,
    0x00000009,0x6f6c6f43,0x75744f72,0x00000074,0x00040005,0x0000000d,0x6f506e69,0x00000073,
    0x00060005,0x00000011,0x505f6c67,0x65567265,0x78657472,0x00000000,0x00060006,0x00000011,
    0x00000000,0x505f6c67,0x7469736f,0x006e6f69,0x00030005,0x00000013,0x00000000,0x00040005,
    0x00000016,0x6c6f4369,0x0000726f,0x00040047,0x00000009,0x0000001e,0x00000000,0x00040047,
    0x0000000d,0x0000001e,0x00000000,0x00050048,0x00000011,0x00000000,0x0000000b,0x00000000,
    0x00030047,0x00000011,0x00000002,0x00040047,0x00000016,0x0000001e,0x00000001,0x00020013,
    0x00000002,0x00030021,0x00000003,0x00000002,0x00030016,0x00000006,0x00000020,0x00040017,
    0x00000007,0x00000006,0x00000003,0x00040020,0x00000008,0x00000003,0x00000007,0x0004003b,
    0x00000008,0x00000009,0x00000003,0x00040017,0x0000000b,0x00000006,0x00000002,0x00040020,
    0x0000000c,0x00000001,0x0000000b,0x0004003b,0x0000000c,0x0000000d,0x00000001,0x00040017,
    0x0000000f,0x00000006,0x00000004,0x0003001e,0x00000011,0x0000000f,0x00040020,0x00000012,
    0x00000003,0x00000011,0x0004003b,0x00000012,0x00000013,0x00000003,0x00040015,0x00000014,
    0x00000020,0x00000001,0x0004002b,0x00000014,0x00000015,0x00000000,0x00040020,0x00000019,
    0x00000001,0x00000007,0x0004003b,0x00000019,0x00000016,0x00000001,0x0004002b,0x00000006,
    0x0000001d,0x3f800000,0x00040020,0x0000001e,0x00000003,0x0000000f,0x00050036,0x00000002,
    0x00000004,0x00000000,0x00000003,0x000200f8,0x00000005,0x0004003d,0x00000007,0x0000001a,
    0x00000016,0x0003003e,0x00000009,0x0000001a,0x0004003d,0x0000000b,0x0000001b,0x0000000d,
    0x00050051,0x00000006,0x0000001c,0x0000001b,0x00000000,0x00050051,0x00000006,0x0000001f,
    0x0000001b,0x00000001,0x00070050,0x0000000f,0x00000020,0x0000001c,0x0000001f,0x00000000,
    0x0000001d,0x00050041,0x0000001e,0x00000021,0x00000013,0x00000015,0x0003003e,0x00000021,
    0x00000020,0x000100fd,0x00010038
};

static const uint32_t fragShaderCode[] = {
    0x07230203,0x00010000,0x00080007,0x00000013,0x00000000,0x00020011,0x00000001,0x0006000b,
    0x00000001,0x4c534c47,0x6474732e,0x3035342e,0x00000000,0x0003000e,0x00000000,0x00000001,
    0x0007000f,0x00000004,0x00000004,0x6e69616d,0x00000000,0x00000009,0x0000000b,0x00030010,
    0x00000004,0x00000007,0x00030003,0x00000002,0x000001c2,0x00040005,0x00000004,0x6e69616d,
    0x00000000,0x00050005,0x00000009,0x4374756f,0x726f6c6f,0x00000000,0x00040005,0x0000000b,
    0x6f6c6f43,0x00000072,0x00040047,0x00000009,0x0000001e,0x00000000,0x00040047,0x0000000b,
    0x0000001e,0x00000000,0x00020013,0x00000002,0x00030021,0x00000003,0x00000002,0x00030016,
    0x00000006,0x00000020,0x00040017,0x00000007,0x00000006,0x00000004,0x00040020,0x00000008,
    0x00000003,0x00000007,0x0004003b,0x00000008,0x00000009,0x00000003,0x00040017,0x0000000a,
    0x00000006,0x00000003,0x00040020,0x0000000c,0x00000001,0x0000000a,0x0004003b,0x0000000c,
    0x0000000b,0x00000001,0x0004002b,0x00000006,0x0000000f,0x3f800000,0x00050036,0x00000002,
    0x00000004,0x00000000,0x00000003,0x000200f8,0x00000005,0x0004003d,0x0000000a,0x0000000d,
    0x0000000b,0x00050051,0x00000006,0x0000000e,0x0000000d,0x00000000,0x00050051,0x00000006,
    0x00000010,0x0000000d,0x00000001,0x00050051,0x00000006,0x00000011,0x0000000d,0x00000002,
    0x00070050,0x00000007,0x00000012,0x0000000e,0x00000010,0x00000011,0x0000000f,0x0003003e,
    0x00000009,0x00000012,0x000100fd,0x00010038
};

struct Vertex {
    glm::vec2 pos;
    glm::vec3 color;
};

// Cube vertices with colors (each face different color)
const std::vector<Vertex> vertices = {
    // Front face (red)
    {{-0.5f, -0.5f}, {1.0f, 0.0f, 0.0f}},
    {{ 0.5f, -0.5f}, {1.0f, 0.0f, 0.0f}},
    {{ 0.5f,  0.5f}, {1.0f, 0.0f, 0.0f}},
    {{-0.5f,  0.5f}, {1.0f, 0.0f, 0.0f}},
};

const std::vector<uint16_t> indices = {
    0, 1, 2, 2, 3, 0
};

class VulkanRenderer {
private:
    VkInstance instance = VK_NULL_HANDLE;
    VkPhysicalDevice physicalDevice = VK_NULL_HANDLE;
    VkDevice device = VK_NULL_HANDLE;
    VkQueue graphicsQueue = VK_NULL_HANDLE;
    VkSurfaceKHR surface = VK_NULL_HANDLE;
    VkSwapchainKHR swapChain = VK_NULL_HANDLE;
    std::vector<VkImage> swapChainImages;
    std::vector<VkImageView> swapChainImageViews;
    VkFormat swapChainImageFormat;
    VkExtent2D swapChainExtent;
    VkRenderPass renderPass = VK_NULL_HANDLE;
    VkPipelineLayout pipelineLayout = VK_NULL_HANDLE;
    VkPipeline graphicsPipeline = VK_NULL_HANDLE;
    std::vector<VkFramebuffer> swapChainFramebuffers;
    VkCommandPool commandPool = VK_NULL_HANDLE;
    VkCommandBuffer commandBuffer = VK_NULL_HANDLE;
    VkSemaphore imageAvailableSemaphore = VK_NULL_HANDLE;
    VkSemaphore renderFinishedSemaphore = VK_NULL_HANDLE;
    VkFence inFlightFence = VK_NULL_HANDLE;
    VkBuffer vertexBuffer = VK_NULL_HANDLE;
    VkDeviceMemory vertexBufferMemory = VK_NULL_HANDLE;
    VkBuffer indexBuffer = VK_NULL_HANDLE;
    VkDeviceMemory indexBufferMemory = VK_NULL_HANDLE;
    
    float clearR = 0.1f, clearG = 0.1f, clearB = 0.15f;

public:
    bool initialize(ANativeWindow* window) {
        LOGI("Starting Vulkan initialization");
        
        if (!createInstance()) {
            LOGE("Failed to create instance");
            return false;
        }
        
        if (!createSurface(window)) {
            LOGE("Failed to create surface");
            return false;
        }
        
        if (!pickPhysicalDevice()) {
            LOGE("Failed to pick physical device");
            return false;
        }
        
        if (!createLogicalDevice()) {
            LOGE("Failed to create logical device");
            return false;
        }
        
        if (!createSwapChain(window)) {
            LOGE("Failed to create swap chain");
            return false;
        }
        
        if (!createImageViews()) {
            LOGE("Failed to create image views");
            return false;
        }
        
        if (!createRenderPass()) {
            LOGE("Failed to create render pass");
            return false;
        }
        
        if (!createGraphicsPipeline()) {
            LOGE("Failed to create graphics pipeline");
            return false;
        }
        
        if (!createFramebuffers()) {
            LOGE("Failed to create framebuffers");
            return false;
        }
        
        if (!createCommandPool()) {
            LOGE("Failed to create command pool");
            return false;
        }
        
        if (!createVertexBuffer()) {
            LOGE("Failed to create vertex buffer");
            return false;
        }
        
        if (!createIndexBuffer()) {
            LOGE("Failed to create index buffer");
            return false;
        }
        
        if (!createCommandBuffer()) {
            LOGE("Failed to create command buffer");
            return false;
        }
        
        if (!createSyncObjects()) {
            LOGE("Failed to create sync objects");
            return false;
        }
        
        LOGI("Vulkan initialization completed successfully");
        return true;
    }

    void render() {
        vkWaitForFences(device, 1, &inFlightFence, VK_TRUE, UINT64_MAX);
        vkResetFences(device, 1, &inFlightFence);

        uint32_t imageIndex;
        vkAcquireNextImageKHR(device, swapChain, UINT64_MAX, imageAvailableSemaphore, VK_NULL_HANDLE, &imageIndex);

        vkResetCommandBuffer(commandBuffer, 0);
        recordCommandBuffer(commandBuffer, imageIndex);

        VkSubmitInfo submitInfo{};
        submitInfo.sType = VK_STRUCTURE_TYPE_SUBMIT_INFO;

        VkSemaphore waitSemaphores[] = {imageAvailableSemaphore};
        VkPipelineStageFlags waitStages[] = {VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT};
        submitInfo.waitSemaphoreCount = 1;
        submitInfo.pWaitSemaphores = waitSemaphores;
        submitInfo.pWaitDstStageMask = waitStages;
        submitInfo.commandBufferCount = 1;
        submitInfo.pCommandBuffers = &commandBuffer;

        VkSemaphore signalSemaphores[] = {renderFinishedSemaphore};
        submitInfo.signalSemaphoreCount = 1;
        submitInfo.pSignalSemaphores = signalSemaphores;

        if (vkQueueSubmit(graphicsQueue, 1, &submitInfo, inFlightFence) != VK_SUCCESS) {
            LOGE("Failed to submit draw command buffer");
        }

        VkPresentInfoKHR presentInfo{};
        presentInfo.sType = VK_STRUCTURE_TYPE_PRESENT_INFO_KHR;
        presentInfo.waitSemaphoreCount = 1;
        presentInfo.pWaitSemaphores = signalSemaphores;

        VkSwapchainKHR swapChains[] = {swapChain};
        presentInfo.swapchainCount = 1;
        presentInfo.pSwapchains = swapChains;
        presentInfo.pImageIndices = &imageIndex;

        vkQueuePresentKHR(graphicsQueue, &presentInfo);
    }

    void setClearColor(float r, float g, float b) {
        clearR = r;
        clearG = g;
        clearB = b;
    }

    void cleanup() {
        if (device != VK_NULL_HANDLE) {
            vkDeviceWaitIdle(device);
            
            if (inFlightFence != VK_NULL_HANDLE) vkDestroyFence(device, inFlightFence, nullptr);
            if (renderFinishedSemaphore != VK_NULL_HANDLE) vkDestroySemaphore(device, renderFinishedSemaphore, nullptr);
            if (imageAvailableSemaphore != VK_NULL_HANDLE) vkDestroySemaphore(device, imageAvailableSemaphore, nullptr);
            if (commandPool != VK_NULL_HANDLE) vkDestroyCommandPool(device, commandPool, nullptr);
            if (vertexBuffer != VK_NULL_HANDLE) vkDestroyBuffer(device, vertexBuffer, nullptr);
            if (vertexBufferMemory != VK_NULL_HANDLE) vkFreeMemory(device, vertexBufferMemory, nullptr);
            if (indexBuffer != VK_NULL_HANDLE) vkDestroyBuffer(device, indexBuffer, nullptr);
            if (indexBufferMemory != VK_NULL_HANDLE) vkFreeMemory(device, indexBufferMemory, nullptr);
            
            for (auto framebuffer : swapChainFramebuffers) {
                vkDestroyFramebuffer(device, framebuffer, nullptr);
            }
            
            if (graphicsPipeline != VK_NULL_HANDLE) vkDestroyPipeline(device, graphicsPipeline, nullptr);
            if (pipelineLayout != VK_NULL_HANDLE) vkDestroyPipelineLayout(device, pipelineLayout, nullptr);
            if (renderPass != VK_NULL_HANDLE) vkDestroyRenderPass(device, renderPass, nullptr);
            
            for (auto imageView : swapChainImageViews) {
                vkDestroyImageView(device, imageView, nullptr);
            }
            
            if (swapChain != VK_NULL_HANDLE) vkDestroySwapchainKHR(device, swapChain, nullptr);
            vkDestroyDevice(device, nullptr);
        }
        
        if (surface != VK_NULL_HANDLE && instance != VK_NULL_HANDLE) {
            vkDestroySurfaceKHR(instance, surface, nullptr);
        }
        
        if (instance != VK_NULL_HANDLE) {
            vkDestroyInstance(instance, nullptr);
        }
    }

private:
    bool createInstance() {
        VkApplicationInfo appInfo{};
        appInfo.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
        appInfo.pApplicationName = "Vulkan RN App";
        appInfo.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
        appInfo.pEngineName = "No Engine";
        appInfo.engineVersion = VK_MAKE_VERSION(1, 0, 0);
        appInfo.apiVersion = VK_API_VERSION_1_0;

        VkInstanceCreateInfo createInfo{};
        createInfo.sType = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
        createInfo.pApplicationInfo = &appInfo;

        const char* extensions[] = {
            VK_KHR_SURFACE_EXTENSION_NAME,
            VK_KHR_ANDROID_SURFACE_EXTENSION_NAME
        };
        createInfo.enabledExtensionCount = 2;
        createInfo.ppEnabledExtensionNames = extensions;

        VkResult result = vkCreateInstance(&createInfo, nullptr, &instance);
        if (result != VK_SUCCESS) {
            LOGE("Failed to create instance: %d", result);
            return false;
        }
        
        LOGI("Vulkan instance created successfully");
        return true;
    }

    bool createSurface(ANativeWindow* window) {
        VkAndroidSurfaceCreateInfoKHR createInfo{};
        createInfo.sType = VK_STRUCTURE_TYPE_ANDROID_SURFACE_CREATE_INFO_KHR;
        createInfo.window = window;

        VkResult result = vkCreateAndroidSurfaceKHR(instance, &createInfo, nullptr, &surface);
        if (result != VK_SUCCESS) {
            LOGE("Failed to create Android surface: %d", result);
            return false;
        }
        
        LOGI("Surface created successfully");
        return true;
    }

    bool pickPhysicalDevice() {
        uint32_t deviceCount = 0;
        vkEnumeratePhysicalDevices(instance, &deviceCount, nullptr);
        
        if (deviceCount == 0) {
            LOGE("Failed to find GPUs with Vulkan support");
            return false;
        }

        std::vector<VkPhysicalDevice> devices(deviceCount);
        vkEnumeratePhysicalDevices(instance, &deviceCount, devices.data());
        
        for (const auto& device : devices) {
            VkPhysicalDeviceProperties properties;
            vkGetPhysicalDeviceProperties(device, &properties);
            LOGI("Found device: %s", properties.deviceName);
        }
        
        physicalDevice = devices[0];
        LOGI("Selected physical device");
        return true;
    }

    int findQueueFamily() {
        uint32_t queueFamilyCount = 0;
        vkGetPhysicalDeviceQueueFamilyProperties(physicalDevice, &queueFamilyCount, nullptr);

        std::vector<VkQueueFamilyProperties> queueFamilies(queueFamilyCount);
        vkGetPhysicalDeviceQueueFamilyProperties(physicalDevice, &queueFamilyCount, queueFamilies.data());

        int i = 0;
        for (const auto& queueFamily : queueFamilies) {
            if (queueFamily.queueFlags & VK_QUEUE_GRAPHICS_BIT) {
                VkBool32 presentSupport = false;
                vkGetPhysicalDeviceSurfaceSupportKHR(physicalDevice, i, surface, &presentSupport);
                if (presentSupport) {
                    return i;
                }
            }
            i++;
        }
        
        return -1;
    }

    bool createLogicalDevice() {
        int queueFamilyIndex = findQueueFamily();
        if (queueFamilyIndex < 0) {
            LOGE("Failed to find suitable queue family");
            return false;
        }

        VkDeviceQueueCreateInfo queueCreateInfo{};
        queueCreateInfo.sType = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
        queueCreateInfo.queueFamilyIndex = queueFamilyIndex;
        queueCreateInfo.queueCount = 1;
        
        float queuePriority = 1.0f;
        queueCreateInfo.pQueuePriorities = &queuePriority;

        VkPhysicalDeviceFeatures deviceFeatures{};

        VkDeviceCreateInfo createInfo{};
        createInfo.sType = VK_STRUCTURE_TYPE_DEVICE_CREATE_INFO;
        createInfo.pQueueCreateInfos = &queueCreateInfo;
        createInfo.queueCreateInfoCount = 1;
        createInfo.pEnabledFeatures = &deviceFeatures;

        const char* deviceExtensions[] = {VK_KHR_SWAPCHAIN_EXTENSION_NAME};
        createInfo.enabledExtensionCount = 1;
        createInfo.ppEnabledExtensionNames = deviceExtensions;

        VkResult result = vkCreateDevice(physicalDevice, &createInfo, nullptr, &device);
        if (result != VK_SUCCESS) {
            LOGE("Failed to create logical device: %d", result);
            return false;
        }

        vkGetDeviceQueue(device, queueFamilyIndex, 0, &graphicsQueue);
        LOGI("Logical device created successfully");
        return true;
    }

    bool createSwapChain(ANativeWindow* window) {
        VkSurfaceCapabilitiesKHR capabilities;
        vkGetPhysicalDeviceSurfaceCapabilitiesKHR(physicalDevice, surface, &capabilities);

        // Get available formats
        uint32_t formatCount;
        vkGetPhysicalDeviceSurfaceFormatsKHR(physicalDevice, surface, &formatCount, nullptr);
        
        if (formatCount == 0) {
            LOGE("No surface formats available");
            return false;
        }
        
        std::vector<VkSurfaceFormatKHR> formats(formatCount);
        vkGetPhysicalDeviceSurfaceFormatsKHR(physicalDevice, surface, &formatCount, formats.data());

        // Log all available formats
        LOGI("Available surface formats:");
        for (const auto& format : formats) {
            LOGI("  Format: %d, ColorSpace: %d", format.format, format.colorSpace);
        }
        
        // Choose format based on what's ACTUALLY available
        VkSurfaceFormatKHR selectedFormat = formats[0]; // Default to first
        
        // Priority order: Try to find these formats in order
        std::vector<VkFormat> preferredFormats = {
            VK_FORMAT_R8G8B8A8_UNORM,    // Format 37 - Most compatible
            VK_FORMAT_B8G8R8A8_UNORM,    // Format 44
            VK_FORMAT_R8G8B8A8_SRGB,     // Format 43
            VK_FORMAT_B8G8R8A8_SRGB,     // Format 50
            VK_FORMAT_A8B8G8R8_UNORM_PACK32, // Format 41
        };
        
        bool formatFound = false;
        for (const auto& preferredFormat : preferredFormats) {
            for (const auto& availableFormat : formats) {
                if (availableFormat.format == preferredFormat) {
                    selectedFormat = availableFormat;
                    formatFound = true;
                    LOGI("Selected preferred format: %d", selectedFormat.format);
                    break;
                }
            }
            if (formatFound) break;
        }
        
        if (!formatFound) {
            LOGI("Using fallback format: %d", selectedFormat.format);
        }
        
        swapChainImageFormat = selectedFormat.format;
        
        // Verify the format is supported for color attachment
        VkFormatProperties formatProps;
        vkGetPhysicalDeviceFormatProperties(physicalDevice, swapChainImageFormat, &formatProps);
        
        if (!(formatProps.optimalTilingFeatures & VK_FORMAT_FEATURE_COLOR_ATTACHMENT_BIT)) {
            LOGE("Selected format %d does not support color attachment!", swapChainImageFormat);
            // Try to find any format that supports color attachment
            for (const auto& format : formats) {
                vkGetPhysicalDeviceFormatProperties(physicalDevice, format.format, &formatProps);
                if (formatProps.optimalTilingFeatures & VK_FORMAT_FEATURE_COLOR_ATTACHMENT_BIT) {
                    selectedFormat = format;
                    swapChainImageFormat = format.format;
                    LOGI("Found color attachment compatible format: %d", swapChainImageFormat);
                    break;
                }
            }
        }
        
        // Get swap chain extent
        swapChainExtent = capabilities.currentExtent;
        if (swapChainExtent.width == UINT32_MAX) {
            int32_t width = ANativeWindow_getWidth(window);
            int32_t height = ANativeWindow_getHeight(window);
            swapChainExtent.width = std::clamp(static_cast<uint32_t>(width), 
                                               capabilities.minImageExtent.width,
                                               capabilities.maxImageExtent.width);
            swapChainExtent.height = std::clamp(static_cast<uint32_t>(height),
                                                capabilities.minImageExtent.height,
                                                capabilities.maxImageExtent.height);
        }

        uint32_t imageCount = capabilities.minImageCount + 1;
        if (capabilities.maxImageCount > 0 && imageCount > capabilities.maxImageCount) {
            imageCount = capabilities.maxImageCount;
        }

        // Get available present modes
        uint32_t presentModeCount;
        vkGetPhysicalDeviceSurfacePresentModesKHR(physicalDevice, surface, &presentModeCount, nullptr);
        std::vector<VkPresentModeKHR> presentModes(presentModeCount);
        vkGetPhysicalDeviceSurfacePresentModesKHR(physicalDevice, surface, &presentModeCount, presentModes.data());

        // Choose present mode
        VkPresentModeKHR selectedPresentMode = VK_PRESENT_MODE_FIFO_KHR;
        for (const auto& mode : presentModes) {
            if (mode == VK_PRESENT_MODE_MAILBOX_KHR) {
                selectedPresentMode = mode;
                break;
            }
        }

        VkSwapchainCreateInfoKHR createInfo{};
        createInfo.sType = VK_STRUCTURE_TYPE_SWAPCHAIN_CREATE_INFO_KHR;
        createInfo.surface = surface;
        createInfo.minImageCount = imageCount;
        createInfo.imageFormat = selectedFormat.format;
        createInfo.imageColorSpace = selectedFormat.colorSpace;
        createInfo.imageExtent = swapChainExtent;
        createInfo.imageArrayLayers = 1;
        createInfo.imageUsage = VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT;
        createInfo.imageSharingMode = VK_SHARING_MODE_EXCLUSIVE;
        createInfo.preTransform = capabilities.currentTransform;
        
        // Choose composite alpha
        VkCompositeAlphaFlagBitsKHR compositeAlpha = VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR;
        std::vector<VkCompositeAlphaFlagBitsKHR> compositeAlphaFlags = {
            VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR,
            VK_COMPOSITE_ALPHA_PRE_MULTIPLIED_BIT_KHR,
            VK_COMPOSITE_ALPHA_POST_MULTIPLIED_BIT_KHR,
            VK_COMPOSITE_ALPHA_INHERIT_BIT_KHR,
        };
        
        for (const auto& flag : compositeAlphaFlags) {
            if (capabilities.supportedCompositeAlpha & flag) {
                compositeAlpha = flag;
                break;
            }
        }
        
        createInfo.compositeAlpha = compositeAlpha;
        createInfo.presentMode = selectedPresentMode;
        createInfo.clipped = VK_TRUE;
        createInfo.oldSwapchain = VK_NULL_HANDLE;

        VkResult result = vkCreateSwapchainKHR(device, &createInfo, nullptr, &swapChain);
        if (result != VK_SUCCESS) {
            LOGE("Failed to create swap chain: %d", result);
            return false;
        }

        vkGetSwapchainImagesKHR(device, swapChain, &imageCount, nullptr);
        swapChainImages.resize(imageCount);
        vkGetSwapchainImagesKHR(device, swapChain, &imageCount, swapChainImages.data());

        LOGI("✅ Swap chain created: %dx%d, %d images, format: %d", 
             swapChainExtent.width, swapChainExtent.height, imageCount, swapChainImageFormat);
        return true;
    }

    bool createImageViews() {
        swapChainImageViews.resize(swapChainImages.size());

        for (size_t i = 0; i < swapChainImages.size(); i++) {
            VkImageViewCreateInfo createInfo{};
            createInfo.sType = VK_STRUCTURE_TYPE_IMAGE_VIEW_CREATE_INFO;
            createInfo.image = swapChainImages[i];
            createInfo.viewType = VK_IMAGE_VIEW_TYPE_2D;
            createInfo.format = swapChainImageFormat;
            createInfo.components.r = VK_COMPONENT_SWIZZLE_IDENTITY;
            createInfo.components.g = VK_COMPONENT_SWIZZLE_IDENTITY;
            createInfo.components.b = VK_COMPONENT_SWIZZLE_IDENTITY;
            createInfo.components.a = VK_COMPONENT_SWIZZLE_IDENTITY;
            createInfo.subresourceRange.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
            createInfo.subresourceRange.baseMipLevel = 0;
            createInfo.subresourceRange.levelCount = 1;
            createInfo.subresourceRange.baseArrayLayer = 0;
            createInfo.subresourceRange.layerCount = 1;

            if (vkCreateImageView(device, &createInfo, nullptr, &swapChainImageViews[i]) != VK_SUCCESS) {
                LOGE("Failed to create image view %zu", i);
                return false;
            }
        }

        LOGI("Created %zu image views", swapChainImageViews.size());
        return true;
    }

    bool createRenderPass() {
        VkAttachmentDescription colorAttachment{};
        colorAttachment.format = swapChainImageFormat;
        colorAttachment.samples = VK_SAMPLE_COUNT_1_BIT;
        colorAttachment.loadOp = VK_ATTACHMENT_LOAD_OP_CLEAR;
        colorAttachment.storeOp = VK_ATTACHMENT_STORE_OP_STORE;
        colorAttachment.stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
        colorAttachment.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
        colorAttachment.initialLayout = VK_IMAGE_LAYOUT_UNDEFINED;
        colorAttachment.finalLayout = VK_IMAGE_LAYOUT_PRESENT_SRC_KHR;

        VkAttachmentReference colorAttachmentRef{};
        colorAttachmentRef.attachment = 0;
        colorAttachmentRef.layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;

        VkSubpassDescription subpass{};
        subpass.pipelineBindPoint = VK_PIPELINE_BIND_POINT_GRAPHICS;
        subpass.colorAttachmentCount = 1;
        subpass.pColorAttachments = &colorAttachmentRef;

        VkSubpassDependency dependency{};
        dependency.srcSubpass = VK_SUBPASS_EXTERNAL;
        dependency.dstSubpass = 0;
        dependency.srcStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
        dependency.srcAccessMask = 0;
        dependency.dstStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
        dependency.dstAccessMask = VK_ACCESS_COLOR_ATTACHMENT_WRITE_BIT;

        VkRenderPassCreateInfo renderPassInfo{};
        renderPassInfo.sType = VK_STRUCTURE_TYPE_RENDER_PASS_CREATE_INFO;
        renderPassInfo.attachmentCount = 1;
        renderPassInfo.pAttachments = &colorAttachment;
        renderPassInfo.subpassCount = 1;
        renderPassInfo.pSubpasses = &subpass;
        renderPassInfo.dependencyCount = 1;
        renderPassInfo.pDependencies = &dependency;

        VkResult result = vkCreateRenderPass(device, &renderPassInfo, nullptr, &renderPass);
        if (result != VK_SUCCESS) {
            LOGE("Failed to create render pass: %d", result);
            return false;
        }

        LOGI("Render pass created successfully");
        return true;
    }

    VkShaderModule createShaderModule(const uint32_t* code, size_t size) {
        VkShaderModuleCreateInfo createInfo{};
        createInfo.sType = VK_STRUCTURE_TYPE_SHADER_MODULE_CREATE_INFO;
        createInfo.codeSize = size;
        createInfo.pCode = code;

        VkShaderModule shaderModule;
        if (vkCreateShaderModule(device, &createInfo, nullptr, &shaderModule) != VK_SUCCESS) {
            LOGE("Failed to create shader module");
            return VK_NULL_HANDLE;
        }

        return shaderModule;
    }

    bool createGraphicsPipeline() {
        VkShaderModule vertShaderModule = createShaderModule(vertShaderCode, sizeof(vertShaderCode));
        VkShaderModule fragShaderModule = createShaderModule(fragShaderCode, sizeof(fragShaderCode));

        if (vertShaderModule == VK_NULL_HANDLE || fragShaderModule == VK_NULL_HANDLE) {
            LOGE("Failed to create shader modules");
            if (vertShaderModule != VK_NULL_HANDLE) vkDestroyShaderModule(device, vertShaderModule, nullptr);
            if (fragShaderModule != VK_NULL_HANDLE) vkDestroyShaderModule(device, fragShaderModule, nullptr);
            return false;
        }

        VkPipelineShaderStageCreateInfo vertShaderStageInfo{};
        vertShaderStageInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_SHADER_STAGE_CREATE_INFO;
        vertShaderStageInfo.stage = VK_SHADER_STAGE_VERTEX_BIT;
        vertShaderStageInfo.module = vertShaderModule;
        vertShaderStageInfo.pName = "main";

        VkPipelineShaderStageCreateInfo fragShaderStageInfo{};
        fragShaderStageInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_SHADER_STAGE_CREATE_INFO;
        fragShaderStageInfo.stage = VK_SHADER_STAGE_FRAGMENT_BIT;
        fragShaderStageInfo.module = fragShaderModule;
        fragShaderStageInfo.pName = "main";

        VkPipelineShaderStageCreateInfo shaderStages[] = {vertShaderStageInfo, fragShaderStageInfo};

        VkVertexInputBindingDescription bindingDescription{};
        bindingDescription.binding = 0;
        bindingDescription.stride = sizeof(Vertex);
        bindingDescription.inputRate = VK_VERTEX_INPUT_RATE_VERTEX;

        std::array<VkVertexInputAttributeDescription, 2> attributeDescriptions{};
        attributeDescriptions[0].binding = 0;
        attributeDescriptions[0].location = 0;
        attributeDescriptions[0].format = VK_FORMAT_R32G32_SFLOAT;
        attributeDescriptions[0].offset = offsetof(Vertex, pos);

        attributeDescriptions[1].binding = 0;
        attributeDescriptions[1].location = 1;
        attributeDescriptions[1].format = VK_FORMAT_R32G32B32_SFLOAT;
        attributeDescriptions[1].offset = offsetof(Vertex, color);

        VkPipelineVertexInputStateCreateInfo vertexInputInfo{};
        vertexInputInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_VERTEX_INPUT_STATE_CREATE_INFO;
        vertexInputInfo.vertexBindingDescriptionCount = 1;
        vertexInputInfo.pVertexBindingDescriptions = &bindingDescription;
        vertexInputInfo.vertexAttributeDescriptionCount = static_cast<uint32_t>(attributeDescriptions.size());
        vertexInputInfo.pVertexAttributeDescriptions = attributeDescriptions.data();

        VkPipelineInputAssemblyStateCreateInfo inputAssembly{};
        inputAssembly.sType = VK_STRUCTURE_TYPE_PIPELINE_INPUT_ASSEMBLY_STATE_CREATE_INFO;
        inputAssembly.topology = VK_PRIMITIVE_TOPOLOGY_TRIANGLE_LIST;
        inputAssembly.primitiveRestartEnable = VK_FALSE;

        VkViewport viewport{};
        viewport.x = 0.0f;
        viewport.y = 0.0f;
        viewport.width = (float) swapChainExtent.width;
        viewport.height = (float) swapChainExtent.height;
        viewport.minDepth = 0.0f;
        viewport.maxDepth = 1.0f;

        VkRect2D scissor{};
        scissor.offset = {0, 0};
        scissor.extent = swapChainExtent;

        VkPipelineViewportStateCreateInfo viewportState{};
        viewportState.sType = VK_STRUCTURE_TYPE_PIPELINE_VIEWPORT_STATE_CREATE_INFO;
        viewportState.viewportCount = 1;
        viewportState.pViewports = &viewport;
        viewportState.scissorCount = 1;
        viewportState.pScissors = &scissor;

        VkPipelineRasterizationStateCreateInfo rasterizer{};
        rasterizer.sType = VK_STRUCTURE_TYPE_PIPELINE_RASTERIZATION_STATE_CREATE_INFO;
        rasterizer.depthClampEnable = VK_FALSE;
        rasterizer.rasterizerDiscardEnable = VK_FALSE;
        rasterizer.polygonMode = VK_POLYGON_MODE_FILL;
        rasterizer.lineWidth = 1.0f;
        rasterizer.cullMode = VK_CULL_MODE_BACK_BIT;
        rasterizer.frontFace = VK_FRONT_FACE_CLOCKWISE;
        rasterizer.depthBiasEnable = VK_FALSE;

        VkPipelineMultisampleStateCreateInfo multisampling{};
        multisampling.sType = VK_STRUCTURE_TYPE_PIPELINE_MULTISAMPLE_STATE_CREATE_INFO;
        multisampling.sampleShadingEnable = VK_FALSE;
        multisampling.rasterizationSamples = VK_SAMPLE_COUNT_1_BIT;

        VkPipelineColorBlendAttachmentState colorBlendAttachment{};
        colorBlendAttachment.colorWriteMask = VK_COLOR_COMPONENT_R_BIT | VK_COLOR_COMPONENT_G_BIT |
                                              VK_COLOR_COMPONENT_B_BIT | VK_COLOR_COMPONENT_A_BIT;
        colorBlendAttachment.blendEnable = VK_FALSE;

        VkPipelineColorBlendStateCreateInfo colorBlending{};
        colorBlending.sType = VK_STRUCTURE_TYPE_PIPELINE_COLOR_BLEND_STATE_CREATE_INFO;
        colorBlending.logicOpEnable = VK_FALSE;
        colorBlending.attachmentCount = 1;
        colorBlending.pAttachments = &colorBlendAttachment;

        VkPipelineLayoutCreateInfo pipelineLayoutInfo{};
        pipelineLayoutInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_LAYOUT_CREATE_INFO;
        pipelineLayoutInfo.setLayoutCount = 0;

        if (vkCreatePipelineLayout(device, &pipelineLayoutInfo, nullptr, &pipelineLayout) != VK_SUCCESS) {
            LOGE("Failed to create pipeline layout");
            vkDestroyShaderModule(device, vertShaderModule, nullptr);
            vkDestroyShaderModule(device, fragShaderModule, nullptr);
            return false;
        }

        VkGraphicsPipelineCreateInfo pipelineInfo{};
        pipelineInfo.sType = VK_STRUCTURE_TYPE_GRAPHICS_PIPELINE_CREATE_INFO;
        pipelineInfo.stageCount = 2;
        pipelineInfo.pStages = shaderStages;
        pipelineInfo.pVertexInputState = &vertexInputInfo;
        pipelineInfo.pInputAssemblyState = &inputAssembly;
        pipelineInfo.pViewportState = &viewportState;
        pipelineInfo.pRasterizationState = &rasterizer;
        pipelineInfo.pMultisampleState = &multisampling;
        pipelineInfo.pColorBlendState = &colorBlending;
        pipelineInfo.layout = pipelineLayout;
        pipelineInfo.renderPass = renderPass;
        pipelineInfo.subpass = 0;

        VkResult result = vkCreateGraphicsPipelines(device, VK_NULL_HANDLE, 1, &pipelineInfo, nullptr, &graphicsPipeline);
        
        vkDestroyShaderModule(device, vertShaderModule, nullptr);
        vkDestroyShaderModule(device, fragShaderModule, nullptr);

        if (result != VK_SUCCESS) {
            LOGE("Failed to create graphics pipeline: %d", result);
            return false;
        }

        LOGI("Graphics pipeline created successfully");
        return true;
    }

    bool createFramebuffers() {
        swapChainFramebuffers.resize(swapChainImageViews.size());

        for (size_t i = 0; i < swapChainImageViews.size(); i++) {
            VkImageView attachments[] = {swapChainImageViews[i]};

            VkFramebufferCreateInfo framebufferInfo{};
            framebufferInfo.sType = VK_STRUCTURE_TYPE_FRAMEBUFFER_CREATE_INFO;
            framebufferInfo.renderPass = renderPass;
            framebufferInfo.attachmentCount = 1;
            framebufferInfo.pAttachments = attachments;
            framebufferInfo.width = swapChainExtent.width;
            framebufferInfo.height = swapChainExtent.height;
            framebufferInfo.layers = 1;

            if (vkCreateFramebuffer(device, &framebufferInfo, nullptr, &swapChainFramebuffers[i]) != VK_SUCCESS) {
                LOGE("Failed to create framebuffer %zu", i);
                return false;
            }
        }

        LOGI("Created %zu framebuffers", swapChainFramebuffers.size());
        return true;
    }

    bool createCommandPool() {
        int queueFamilyIndex = findQueueFamily();

        VkCommandPoolCreateInfo poolInfo{};
        poolInfo.sType = VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO;
        poolInfo.flags = VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT;
        poolInfo.queueFamilyIndex = queueFamilyIndex;

        if (vkCreateCommandPool(device, &poolInfo, nullptr, &commandPool) != VK_SUCCESS) {
            LOGE("Failed to create command pool");
            return false;
        }

        LOGI("Command pool created successfully");
        return true;
    }

    uint32_t findMemoryType(uint32_t typeFilter, VkMemoryPropertyFlags properties) {
        VkPhysicalDeviceMemoryProperties memProperties;
        vkGetPhysicalDeviceMemoryProperties(physicalDevice, &memProperties);

        for (uint32_t i = 0; i < memProperties.memoryTypeCount; i++) {
            if ((typeFilter & (1 << i)) && (memProperties.memoryTypes[i].propertyFlags & properties) == properties) {
                return i;
            }
        }

        return 0;
    }

    bool createBuffer(VkDeviceSize size, VkBufferUsageFlags usage, VkMemoryPropertyFlags properties,
                     VkBuffer& buffer, VkDeviceMemory& bufferMemory) {
        VkBufferCreateInfo bufferInfo{};
        bufferInfo.sType = VK_STRUCTURE_TYPE_BUFFER_CREATE_INFO;
        bufferInfo.size = size;
        bufferInfo.usage = usage;
        bufferInfo.sharingMode = VK_SHARING_MODE_EXCLUSIVE;

        if (vkCreateBuffer(device, &bufferInfo, nullptr, &buffer) != VK_SUCCESS) {
            LOGE("Failed to create buffer");
            return false;
        }

        VkMemoryRequirements memRequirements;
        vkGetBufferMemoryRequirements(device, buffer, &memRequirements);

        VkMemoryAllocateInfo allocInfo{};
        allocInfo.sType = VK_STRUCTURE_TYPE_MEMORY_ALLOCATE_INFO;
        allocInfo.allocationSize = memRequirements.size;
        allocInfo.memoryTypeIndex = findMemoryType(memRequirements.memoryTypeBits, properties);

        if (vkAllocateMemory(device, &allocInfo, nullptr, &bufferMemory) != VK_SUCCESS) {
            LOGE("Failed to allocate buffer memory");
            return false;
        }

        vkBindBufferMemory(device, buffer, bufferMemory, 0);
        return true;
    }

    bool createVertexBuffer() {
        VkDeviceSize bufferSize = sizeof(vertices[0]) * vertices.size();

        if (!createBuffer(bufferSize, VK_BUFFER_USAGE_VERTEX_BUFFER_BIT,
                         VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT,
                         vertexBuffer, vertexBufferMemory)) {
            return false;
        }

        void* data;
        vkMapMemory(device, vertexBufferMemory, 0, bufferSize, 0, &data);
        memcpy(data, vertices.data(), (size_t) bufferSize);
        vkUnmapMemory(device, vertexBufferMemory);

        LOGI("Vertex buffer created");
        return true;
    }

    bool createIndexBuffer() {
        VkDeviceSize bufferSize = sizeof(indices[0]) * indices.size();

        if (!createBuffer(bufferSize, VK_BUFFER_USAGE_INDEX_BUFFER_BIT,
                         VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT,
                         indexBuffer, indexBufferMemory)) {
            return false;
        }

        void* data;
        vkMapMemory(device, indexBufferMemory, 0, bufferSize, 0, &data);
        memcpy(data, indices.data(), (size_t) bufferSize);
        vkUnmapMemory(device, indexBufferMemory);

        LOGI("Index buffer created");
        return true;
    }

    bool createCommandBuffer() {
        VkCommandBufferAllocateInfo allocInfo{};
        allocInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
        allocInfo.commandPool = commandPool;
        allocInfo.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;
        allocInfo.commandBufferCount = 1;

        if (vkAllocateCommandBuffers(device, &allocInfo, &commandBuffer) != VK_SUCCESS) {
            LOGE("Failed to allocate command buffer");
            return false;
        }

        LOGI("Command buffer created");
        return true;
    }

    bool createSyncObjects() {
        VkSemaphoreCreateInfo semaphoreInfo{};
        semaphoreInfo.sType = VK_STRUCTURE_TYPE_SEMAPHORE_CREATE_INFO;

        VkFenceCreateInfo fenceInfo{};
        fenceInfo.sType = VK_STRUCTURE_TYPE_FENCE_CREATE_INFO;
        fenceInfo.flags = VK_FENCE_CREATE_SIGNALED_BIT;

        if (vkCreateSemaphore(device, &semaphoreInfo, nullptr, &imageAvailableSemaphore) != VK_SUCCESS ||
            vkCreateSemaphore(device, &semaphoreInfo, nullptr, &renderFinishedSemaphore) != VK_SUCCESS ||
            vkCreateFence(device, &fenceInfo, nullptr, &inFlightFence) != VK_SUCCESS) {
            LOGE("Failed to create sync objects");
            return false;
        }

        LOGI("Sync objects created");
        return true;
    }

    void recordCommandBuffer(VkCommandBuffer commandBuffer, uint32_t imageIndex) {
        VkCommandBufferBeginInfo beginInfo{};
        beginInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;

        vkBeginCommandBuffer(commandBuffer, &beginInfo);

        VkRenderPassBeginInfo renderPassInfo{};
        renderPassInfo.sType = VK_STRUCTURE_TYPE_RENDER_PASS_BEGIN_INFO;
        renderPassInfo.renderPass = renderPass;
        renderPassInfo.framebuffer = swapChainFramebuffers[imageIndex];
        renderPassInfo.renderArea.offset = {0, 0};
        renderPassInfo.renderArea.extent = swapChainExtent;

        VkClearValue clearColor = {{{clearR, clearG, clearB, 1.0f}}};
        renderPassInfo.clearValueCount = 1;
        renderPassInfo.pClearValues = &clearColor;

        vkCmdBeginRenderPass(commandBuffer, &renderPassInfo, VK_SUBPASS_CONTENTS_INLINE);
        vkCmdBindPipeline(commandBuffer, VK_PIPELINE_BIND_POINT_GRAPHICS, graphicsPipeline);

        VkBuffer vertexBuffers[] = {vertexBuffer};
        VkDeviceSize offsets[] = {0};
        vkCmdBindVertexBuffers(commandBuffer, 0, 1, vertexBuffers, offsets);
        vkCmdBindIndexBuffer(commandBuffer, indexBuffer, 0, VK_INDEX_TYPE_UINT16);

        vkCmdDrawIndexed(commandBuffer, static_cast<uint32_t>(indices.size()), 1, 0, 0, 0);
        vkCmdEndRenderPass(commandBuffer);

        vkEndCommandBuffer(commandBuffer);
    }
};

static VulkanRenderer* renderer = nullptr;

extern "C" JNIEXPORT jboolean JNICALL
Java_com_vulkanimplementation_VulkanModule_nativeInitVulkan(
        JNIEnv* env, jobject /* this */, jobject surface) {
    
    ANativeWindow* window = ANativeWindow_fromSurface(env, surface);
    if (!window) {
        LOGE("Failed to get native window from surface");
        return JNI_FALSE;
    }

    if (renderer) {
        delete renderer;
    }
    
    renderer = new VulkanRenderer();
    bool success = renderer->initialize(window);
    
    if (!success) {
        delete renderer;
        renderer = nullptr;
        ANativeWindow_release(window);
        return JNI_FALSE;
    }

    ANativeWindow_release(window);
    LOGI("Vulkan 3D Cube initialized successfully");
    return JNI_TRUE;
}

extern "C" JNIEXPORT void JNICALL
Java_com_vulkanimplementation_VulkanModule_nativeRender(
        JNIEnv* env, jobject /* this */, jfloat r, jfloat g, jfloat b) {
    if (renderer) {
        renderer->setClearColor(r, g, b);
        renderer->render();
    }
}

extern "C" JNIEXPORT void JNICALL
Java_com_vulkanimplementation_VulkanModule_nativeSetRotation(
        JNIEnv* env, jobject /* this */, jfloat x, jfloat y, jfloat z) {
    // Not implemented in simple version
}

extern "C" JNIEXPORT void JNICALL
Java_com_vulkanimplementation_VulkanModule_nativeSetScale(
        JNIEnv* env, jobject /* this */, jfloat scale) {
    // Not implemented in simple version
}

extern "C" JNIEXPORT void JNICALL
Java_com_vulkanimplementation_VulkanModule_nativeUpdateCamera(
        JNIEnv* env, jobject /* this */, jfloat deltaX, jfloat deltaY) {
    // Not implemented in simple version
}

extern "C" JNIEXPORT void JNICALL
Java_com_vulkanimplementation_VulkanModule_nativeCleanup(JNIEnv* env, jobject /* this */) {
    if (renderer) {
        renderer->cleanup();
        delete renderer;
        renderer = nullptr;
        LOGI("Vulkan cleaned up");
    }
}