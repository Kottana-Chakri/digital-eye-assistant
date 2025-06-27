
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface VoiceControlProps {
  onSpeech: (text: string) => void;
}

const VoiceControl = ({ onSpeech }: VoiceControlProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setTranscript(finalTranscript);
            processVoiceCommand(finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          toast({
            title: 'Voice Recognition Error',
            description: 'Please try again or check your microphone permissions.',
            variant: 'destructive',
          });
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const processVoiceCommand = (command: string) => {
    const lowercaseCommand = command.toLowerCase().trim();
    
    // Basic command processing
    if (lowercaseCommand.includes('hello') || lowercaseCommand.includes('hi')) {
      onSpeech('Hello! I am BlindAssist, ready to help you navigate the digital world. What would you like me to do?');
    } else if (lowercaseCommand.includes('help')) {
      onSpeech('I can help you with web navigation, reading content, describing images, and analyzing text. You can say commands like "search for news", "describe this image", or "read this page".');
    } else if (lowercaseCommand.includes('search')) {
      const searchTerm = lowercaseCommand.replace(/search (for )?/i, '');
      onSpeech(`I am searching for ${searchTerm}. Please wait while I find relevant information.`);
    } else if (lowercaseCommand.includes('stop') || lowercaseCommand.includes('quiet')) {
      window.speechSynthesis.cancel();
      onSpeech('Audio stopped.');
    } else {
      onSpeech(`I heard: ${command}. I am processing your request.`);
    }
  };

  const toggleListening = () => {
    if (!isSupported) {
      toast({
        title: 'Voice Recognition Not Supported',
        description: 'Your browser does not support voice recognition.',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      onSpeech('Voice listening stopped.');
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
      onSpeech('Voice listening started. Speak your command.');
    }
  };

  const stopAllAudio = () => {
    window.speechSynthesis.cancel();
    onSpeech('All audio output stopped.');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-cyan-300 mb-4">Voice Command Center</h3>
        <p className="text-slate-400 mb-6">
          Click the microphone button and speak your commands. I can help you search, navigate, and analyze content.
        </p>
      </div>

      <div className="flex justify-center space-x-4">
        <Button
          onClick={toggleListening}
          size="lg"
          className={`h-16 w-16 rounded-full ${
            isListening 
              ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
              : 'bg-cyan-600 hover:bg-cyan-700'
          }`}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </Button>

        <Button
          onClick={stopAllAudio}
          size="lg"
          variant="outline"
          className="h-16 w-16 rounded-full border-cyan-500 text-cyan-300 hover:bg-cyan-600 hover:text-white"
          aria-label="Stop all audio"
        >
          <VolumeX className="w-8 h-8" />
        </Button>
      </div>

      {isListening && (
        <Card className="bg-slate-700 border-cyan-500/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-cyan-300 font-medium">Listening...</span>
            </div>
            <p className="text-slate-300">Speak clearly and I will process your command.</p>
          </CardContent>
        </Card>
      )}

      {transcript && (
        <Card className="bg-slate-700 border-cyan-500/50">
          <CardContent className="p-4">
            <h4 className="text-cyan-300 font-medium mb-2">Last Command:</h4>
            <p className="text-white">{transcript}</p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-700 border-cyan-500/50">
        <CardContent className="p-4">
          <h4 className="text-cyan-300 font-medium mb-3">Common Voice Commands:</h4>
          <ul className="space-y-2 text-slate-300">
            <li>• "Search for [topic]" - Search the web</li>
            <li>• "Help" - Get assistance</li>
            <li>• "Stop" or "Quiet" - Stop audio output</li>
            <li>• "Hello" - Get a greeting</li>
            <li>• "Read this page" - Analyze current content</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceControl;
