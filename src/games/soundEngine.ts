
export class Audio {

    audioCtx: InstanceType<typeof AudioContext>;
    audioBuffer: InstanceType<typeof AudioBuffer> | undefined;

    constructor(audioCtx: InstanceType<typeof AudioContext>) {
        this.audioCtx = audioCtx;
    }

async loadSound(url: string) {
    try {
        // Validate input
        if (!url) throw new Error('No audio file path provided');

        // Get absolute URL for extension resource
        const soundUrl = chrome.runtime.getURL(url);
        console.log("Attempt to fetch at: ", soundUrl);
        
        if (soundUrl == 'chrome-extension://invalid/') {
            throw new Error(`Chrome runtime returned INVALID url while trying to fetch ${url}`);
        }
        // Fetch the audio file
        const response = await fetch(soundUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
        }
        
        // Convert to array buffer
        const arrayBuffer = await response.arrayBuffer();
        
        // Decode audio data
        this.audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
        
    } catch (error) {
        console.error('Error loading sound:', error);
        // Add your error handling/recovery logic here
        throw error; // Re-throw if you want calling code to handle it
    }
}

    playSound(volume: number) {
        if (this.audioBuffer == undefined) {
            throw new Error("Audio buffer has not been defined yet");
        }
        const source = this.audioCtx.createBufferSource();
        source.buffer = this.audioBuffer;

        const gainNode = this.audioCtx.createGain();
        gainNode.gain.value = volume; // 🎚️ Set the volume

        source.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        source.start();
    }   
}