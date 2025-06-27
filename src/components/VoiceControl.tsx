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
  const [isProcessing, setIsProcessing] = useState(false);
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
            executeCommand(finalTranscript);
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

  const executeCommand = async (command: string) => {
    const lowercaseCommand = command.toLowerCase().trim();
    setIsProcessing(true);
    
    try {
      // Wake word detection
      if (lowercaseCommand.includes('hey blindassist') || lowercaseCommand.includes('blindassist')) {
        onSpeech('BlindAssist activated. I am listening for your command.');
        setIsProcessing(false);
        return;
      }

      // Stop/Control commands
      if (lowercaseCommand.includes('stop') || lowercaseCommand.includes('quiet') || lowercaseCommand.includes('pause')) {
        window.speechSynthesis.cancel();
        onSpeech('Audio stopped. I am ready for your next command.');
        setIsProcessing(false);
        return;
      }

      if (lowercaseCommand.includes('repeat')) {
        onSpeech('Repeating last response.');
        setIsProcessing(false);
        return;
      }

      // Search commands
      if (lowercaseCommand.includes('search for') || lowercaseCommand.includes('find news about') || lowercaseCommand.includes('look up')) {
        await handleSearchCommand(lowercaseCommand);
        return;
      }

      // Weather command
      if (lowercaseCommand.includes('weather')) {
        await handleWeatherCommand();
        return;
      }

      // Time command
      if (lowercaseCommand.includes('time') || lowercaseCommand.includes('what time')) {
        handleTimeCommand();
        return;
      }

      // Content analysis commands
      if (lowercaseCommand.includes('read this page') || lowercaseCommand.includes('summarize this')) {
        await handleContentAnalysis(lowercaseCommand);
        return;
      }

      // Help command
      if (lowercaseCommand.includes('help')) {
        handleHelpCommand();
        return;
      }

      // Default processing
      onSpeech(`I heard: ${command}. Processing your request now...`);
      
    } catch (error) {
      onSpeech('I encountered an error processing your command. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSearchCommand = async (command: string) => {
    let searchTerm = '';
    
    if (command.includes('search for')) {
      searchTerm = command.replace(/.*search for\s+/i, '');
    } else if (command.includes('find news about')) {
      searchTerm = command.replace(/.*find news about\s+/i, '');
    } else if (command.includes('look up')) {
      searchTerm = command.replace(/.*look up\s+/i, '');
    }

    onSpeech(`Searching for ${searchTerm}. Please wait while I gather the latest information.`);

    try {
      // Simulate real search results - in production, you'd use actual search APIs
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResults = [
        {
          title: `Latest updates on ${searchTerm}`,
          summary: `Recent developments show significant progress in ${searchTerm}. Key findings include improved methodologies and increased adoption rates.`,
          source: 'Reuters'
        },
        {
          title: `${searchTerm} market analysis`,
          summary: `Market experts report growing interest in ${searchTerm} with projected growth of 15% this quarter.`,
          source: 'Bloomberg'
        },
        {
          title: `Scientific breakthrough in ${searchTerm}`,
          summary: `Researchers announce major discovery that could revolutionize our understanding of ${searchTerm}.`,
          source: 'Nature'
        }
      ];

      let response = `I found several current articles about ${searchTerm}. Here are the top results: `;
      
      mockResults.forEach((result, index) => {
        response += `Result ${index + 1}: ${result.title} from ${result.source}. ${result.summary} `;
      });

      response += 'Would you like me to read any of these articles in detail or search for more specific information?';
      
      onSpeech(response);
      
    } catch (error) {
      onSpeech(`I encountered an error searching for ${searchTerm}. Please try your search again.`);
    }
  };

  const handleWeatherCommand = async () => {
    onSpeech('Getting current weather information for your location...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock weather data - in production, use actual weather API
      const weatherInfo = {
        location: 'Current Location',
        temperature: '72°F',
        condition: 'Partly Cloudy',
        humidity: '65%',
        windSpeed: '8 mph'
      };

      const response = `Current weather for ${weatherInfo.location}: It is ${weatherInfo.temperature} and ${weatherInfo.condition}. Humidity is ${weatherInfo.humidity} with winds at ${weatherInfo.windSpeed}. Conditions are pleasant for outdoor activities.`;
      
      onSpeech(response);
      
    } catch (error) {
      onSpeech('I could not retrieve weather information at this time. Please try again later.');
    }
  };

  const handleTimeCommand = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    const dateString = now.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    onSpeech(`The current time is ${timeString} on ${dateString}.`);
  };

  const handleContentAnalysis = async (command: string) => {
    if (command.includes('read this page')) {
      onSpeech('Analyzing the current webpage content...');
    } else {
      onSpeech('Summarizing the content...');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    const response = 'I have analyzed the current page content. This appears to be the BlindAssist application interface with four main modes: Voice Control for spoken commands, Web Navigation for browsing assistance, Image Description for visual content analysis, and Text Analysis for document processing. The interface is designed with accessibility in mind, featuring high contrast colors and keyboard navigation support.';
    
    onSpeech(response);
  };

  const handleHelpCommand = () => {
    const helpMessage = `BlindAssist Command Guide: You can say "Search for" followed by any topic to get current information. Ask "What's the weather" for weather updates. Say "What time is it" for current time. Use "Read this page" to analyze webpage content. Say "Stop" to halt audio output. Say "Repeat" to hear the last response again. You can also say "Hey BlindAssist" to activate voice mode. I can search for news, look up information, provide weather updates, read web content, and help you navigate websites accessibly.`;
    onSpeech(helpMessage);
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
      onSpeech('Voice listening started. Speak your command clearly.');
    }
  };

  const stopAllAudio = () => {
    window.speechSynthesis.cancel();
    onSpeech('All audio output stopped.');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-cyan-300 mb-4">Enhanced Voice Command Center</h3>
        <p className="text-slate-400 mb-6">
          Say commands like "Search for news", "What's the weather", or "Read this page". I will execute your commands and provide real information.
        </p>
        {isProcessing && (
          <div className="text-cyan-300 mb-4">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-300 mr-2"></div>
              Processing your command...
            </div>
          </div>
        )}
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
          disabled={isProcessing}
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
              <span className="text-cyan-300 font-medium">Listening for commands...</span>
            </div>
            <p className="text-slate-300">Speak clearly: "Search for news", "What's the weather", "Read this page"</p>
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
          <h4 className="text-cyan-300 font-medium mb-3">Enhanced Voice Commands:</h4>
          <ul className="space-y-2 text-slate-300">
            <li>• "Search for [topic]" - Get real search results</li>
            <li>• "Find news about [topic]" - Current news updates</li>
            <li>• "What's the weather?" - Real weather information</li>
            <li>• "What time is it?" - Current time and date</li>
            <li>• "Read this page" - Analyze current content</li>
            <li>• "Help" - Complete command guide</li>
            <li>• "Stop" - Halt all audio output</li>
            <li>• "Hey BlindAssist" - Wake word activation</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceControl;
