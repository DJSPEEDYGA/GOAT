/**
 * GPU Optimizer Module for GOAT App
 * Optimizes dual RTX 3090 SLI configuration for LLM/AI workloads
 * and video editing acceleration
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class GPUOptimizer {
    constructor() {
        this.gpuConfig = {
            totalVRAM: 48, // 2x 24GB RTX 3090
            gpus: [
                { id: 0, name: 'RTX 3090', vram: 24, uuid: null },
                { id: 1, name: 'RTX 3090', vram: 24, uuid: null }
            ],
            sliBridge: true,
            nvlink: false, // 3090 doesn't have NVLink consumer support
            preferredMode: 'tensor-parallel' // 'layer-split' or 'tensor-parallel'
        };
        
        this.llmModels = {
            // Models optimized for dual 3090 setup
            reasoning: {
                name: 'deepseek-r1:70b-llama-distill-q4_K_M',
                size: 42, // GB
                contextWindow: 131072,
                recommended: true,
                useCase: 'Complex reasoning, coding, analysis'
            },
            chat: {
                name: 'qwen3.5-35b-a3b-q8_0',
                size: 35,
                contextWindow: 131072,
                tensorSplit: [24, 12],
                speed: 71, // tok/s
                useCase: 'Fast chat, general assistance'
            },
            singleGPU: {
                name: 'qwen3:30b-a3b-q8_0',
                size: 16.7,
                contextWindow: 262144,
                speed: 107, // tok/s
                useCase: 'Maximum speed on single GPU'
            },
            codeAssistant: {
                name: 'codestral:22b',
                size: 14,
                contextWindow: 32768,
                useCase: 'Code completion and generation'
            }
        };
        
        this.videoEditing = {
            davinciResolve: {
                recommended: true,
                gpuScaling: 1.5, // 50% improvement per additional GPU
                features: [
                    'GPU-accelerated color grading',
                    'Temporal noise reduction',
                    'Optical flow',
                    'Face refinement',
                    '8K editing support'
                ]
            },
            premierePro: {
                recommended: true,
                gpuScaling: 1.3,
                features: [
                    'Hardware encoding/decoding',
                    'GPU effects',
                    'Auto reframe'
                ]
            }
        };
    }

    /**
     * Get current GPU status and utilization
     */
    async getGPUStatus() {
        return new Promise((resolve, reject) => {
            exec('nvidia-smi --query-gpu=index,name,memory.total,memory.used,memory.free,utilization.gpu,temperature.gpu --format=json', 
                (error, stdout, stderr) => {
                    if (error) {
                        reject(new Error(`Failed to get GPU status: ${error.message}`));
                        return;
                    }
                    try {
                        const gpus = JSON.parse(stdout);
                        resolve({
                            success: true,
                            gpus: gpus.map((gpu, i) => ({
                                id: i,
                                name: gpu.name,
                                vramTotal: parseInt(gpu.memory_total) / 1024,
                                vramUsed: parseInt(gpu.memory_used) / 1024,
                                vramFree: parseInt(gpu.memory_free) / 1024,
                                utilization: gpu.utilization_gpu,
                                temperature: gpu.temperature_gpu
                            })),
                            timestamp: new Date().toISOString()
                        });
                    } catch (e) {
                        reject(new Error('Failed to parse GPU status'));
                    }
                }
            );
        });
    }

    /**
     * Get recommended LLM command for dual GPU setup
     */
    getLLMConfig(modelKey = 'reasoning') {
        const model = this.llmModels[modelKey];
        if (!model) {
            return { error: 'Model not found' };
        }

        const configs = {
            ollama: {
                command: `ollama run ${model.name}`,
                env: {
                    CUDA_VISIBLE_DEVICES: '0,1'
                }
            },
            llamaCpp: {
                command: `llama-server -m ${model.name}.gguf -ngl 99 -c ${model.contextWindow} -fa on --cache-type-k q4_0 --cache-type-v q4_0 --tensor-split 24,24`,
                description: 'Best for local inference with dual GPUs'
            },
            vllm: {
                command: `python -m vllm.entrypoints.api_server --model ${model.name} --tensor-parallel-size 2 --gpu-memory-utilization 0.9`,
                description: 'Best for production API serving'
            }
        };

        return {
            model: model,
            configs: configs,
            estimatedVRAM: model.size,
            fitsInMemory: model.size <= this.gpuConfig.totalVRAM
        };
    }

    /**
     * Get video editing optimization settings
     */
    getVideoEditingConfig() {
        return {
            daVinciResolve: {
                settings: {
                    'GPU Processing Mode': 'OpenCL',
                    'GPU Configuration': 'Multiple GPUs enabled',
                    'Memory': 'Optimize for Performance',
                    'Decode': 'Hardware Acceleration'
                },
                performance: {
                    singleGPU: '1x baseline',
                    dualGPU: '1.5x faster for GPU effects',
                    estimatedSpeedup: '50% improvement in effects processing'
                },
                tips: [
                    'Enable "Use NVIDIA Encoder" in preferences',
                    'Set GPU memory to "Dedicated" for best performance',
                    'Use ProRes or DNxHR codecs for best GPU utilization',
                    'Enable "Hardware Decoding" for H.264/H.265 footage'
                ]
            },
            premierePro: {
                settings: {
                    'Mercury Playback Engine': 'GPU Acceleration (CUDA)',
                    'Memory': 'Optimize for Performance'
                },
                performance: {
                    dualGPU: '30% faster encoding with NVENC'
                }
            }
        };
    }

    /**
     * Check if SLI bridge is properly connected
     */
    async checkSLIStatus() {
        return new Promise((resolve, reject) => {
            exec('nvidia-smi -q | grep -A 5 "GPU Link"', (error, stdout, stderr) => {
                if (error) {
                    resolve({ sliConnected: false, message: 'Could not detect SLI status' });
                    return;
                }
                resolve({
                    sliConnected: stdout.includes('SLI') || stdout.includes('NVLINK'),
                    details: stdout
                });
            });
        });
    }

    /**
     * Get optimal tensor split for current model
     */
    getOptimalTensorSplit(modelSizeGB) {
        const vramPerGPU = 24; // RTX 3090
        
        if (modelSizeGB <= vramPerGPU) {
            // Model fits on single GPU, run on one for better performance
            return {
                split: [modelSizeGB, 0],
                mode: 'single-gpu',
                reason: 'Model fits on single GPU, better latency'
            };
        } else if (modelSizeGB <= vramPerGPU * 2) {
            // Model needs both GPUs
            const firstGPU = Math.min(modelSizeGB, vramPerGPU);
            const secondGPU = modelSizeGB - firstGPU;
            return {
                split: [firstGPU, secondGPU],
                mode: 'tensor-parallel',
                reason: 'Model requires both GPUs for optimal performance'
            };
        } else {
            // Model too large, need to offload to CPU
            return {
                split: [vramPerGPU, vramPerGPU],
                mode: 'cpu-offload',
                cpuMemory: modelSizeGB - (vramPerGPU * 2),
                reason: 'Model exceeds GPU memory, CPU offloading required'
            };
        }
    }

    /**
     * Generate performance benchmark
     */
    async runBenchmark() {
        console.log('🎮 GPU Benchmark for Dual RTX 3090 Setup');
        console.log('========================================');
        
        const status = await this.getGPUStatus();
        console.log('\n📊 Current GPU Status:');
        console.log(JSON.stringify(status, null, 2));
        
        const sliStatus = await this.checkSLIStatus();
        console.log('\n🔗 SLI Bridge Status:', sliStatus);
        
        const llmConfig = this.getLLMConfig('reasoning');
        console.log('\n🤖 Recommended LLM Configuration:');
        console.log(JSON.stringify(llmConfig, null, 2));
        
        const videoConfig = this.getVideoEditingConfig();
        console.log('\n🎬 Video Editing Optimization:');
        console.log(JSON.stringify(videoConfig, null, 2));
        
        return {
            gpuStatus: status,
            sliStatus: sliStatus,
            llmConfig: llmConfig,
            videoConfig: videoConfig
        };
    }

    /**
     * Set power limit for GPUs (requires sudo)
     */
    async setPowerLimit(watts = 350) {
        return new Promise((resolve, reject) => {
            exec(`sudo nvidia-smi -pl ${watts}`, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Failed to set power limit: ${error.message}`));
                    return;
                }
                resolve({
                    success: true,
                    powerLimit: watts,
                    message: `Power limit set to ${watts}W for all GPUs`
                });
            });
        });
    }

    /**
     * Enable/disable GPU persistence mode
     */
    async setPersistenceMode(enabled = true) {
        return new Promise((resolve, reject) => {
            const mode = enabled ? '1' : '0';
            exec(`sudo nvidia-smi -pm ${mode}`, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Failed to set persistence mode: ${error.message}`));
                    return;
                }
                resolve({
                    success: true,
                    persistenceMode: enabled,
                    message: `Persistence mode ${enabled ? 'enabled' : 'disabled'}`
                });
            });
        });
    }
}

// Export for use in GOAT app
module.exports = { GPUOptimizer };

// CLI interface
if (require.main === module) {
    const optimizer = new GPUOptimizer();
    optimizer.runBenchmark().then(results => {
        console.log('\n✅ Benchmark complete!');
    }).catch(err => {
        console.error('❌ Benchmark failed:', err.message);
    });
}