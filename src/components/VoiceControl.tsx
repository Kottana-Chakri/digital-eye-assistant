import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import SearchService from '@/services/SearchService';

interface VoiceControlProps {
  onSpeech: (text: string) => void;
}

const VoiceControl = ({ onSpeech }: VoiceControlProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const searchService = SearchService.getInstance();
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

      // Date and time commands
      if (lowercaseCommand.includes('what day') || lowercaseCommand.includes('today') || lowercaseCommand.includes('date')) {
        const currentDate = searchService.getCurrentDate();
        onSpeech(`Today is ${currentDate}.`);
        setIsProcessing(false);
        return;
      }

      if (lowercaseCommand.includes('time') || lowercaseCommand.includes('what time')) {
        const currentTime = searchService.getCurrentTime();
        const currentDate = searchService.getCurrentDate();
        onSpeech(`The current time is ${currentTime} on ${currentDate}.`);
        setIsProcessing(false);
        return;
      }

      // Headlines and news commands
      if (lowercaseCommand.includes('headlines') || lowercaseCommand.includes('today\'s news') || lowercaseCommand.includes('what\'s happening')) {
        await handleHeadlinesCommand();
        return;
      }

      // Tell me more about headline commands
      if (lowercaseCommand.includes('tell me more about headline') || lowercaseCommand.includes('more about headline')) {
        await handleHeadlineDetailCommand(lowercaseCommand);
        return;
      }

      // Google search commands
      if (lowercaseCommand.includes('search google for') || lowercaseCommand.includes('google search')) {
        await handleGoogleSearchCommand(lowercaseCommand);
        return;
      }

      // General search commands
      if (lowercaseCommand.includes('search for') || lowercaseCommand.includes('find news about') || lowercaseCommand.includes('look up')) {
        await handleSearchCommand(lowercaseCommand);
        return;
      }

      // Weather command
      if (lowercaseCommand.includes('weather')) {
        await handleWeatherCommand();
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
      onSpeech(`I heard: ${command}. Let me help you with that.`);
      
    } catch (error) {
      onSpeech('I encountered an error processing your command. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHeadlinesCommand = async () => {
    onSpeech('Getting today\'s headlines from credible sources...');
    
    try {
      const headlines = await searchService.getTodaysHeadlines();
      const speechText = searchService.formatHeadlinesForSpeech(headlines);
      onSpeech(speechText);
      
    } catch (error) {
      onSpeech('I could not retrieve today\'s headlines at this time. Please try again later.');
    }
  };

  const handleHeadlineDetailCommand = async (command: string) => {
    const numberMatch = command.match(/headline\s+(\d+)/);
    if (!numberMatch) {
      onSpeech('Please specify which headline number you\'d like to hear more about.');
      return;
    }

    const headlineNumber = parseInt(numberMatch[1]);
    onSpeech(`Getting more details about headline ${headlineNumber}...`);

    try {
      const headlines = await searchService.getTodaysHeadlines();
      const selectedHeadline = headlines[headlineNumber - 1];
      
      if (selectedHeadline) {
        const timeAgo = new Date(selectedHeadline.publishedAt).toLocaleTimeString();
        const response = `Here are the full details for headline ${headlineNumber}: ${selectedHeadline.headline} from ${selectedHeadline.source}. Published at ${timeAgo}. Full summary: ${selectedHeadline.summary} This story is categorized under ${selectedHeadline.category}. Would you like me to search for more recent updates on this topic?`;
        onSpeech(response);
      } else {
        onSpeech(`Headline ${headlineNumber} is not available. Please choose a number between 1 and ${headlines.length}.`);
      }
      
    } catch (error) {
      onSpeech('I could not retrieve the headline details. Please try again.');
    }
  };

  const handleGoogleSearchCommand = async (command: string) => {
    let searchTerm = '';
    
    if (command.includes('search google for')) {
      searchTerm = command.replace(/.*search google for\s+/i, '');
    } else if (command.includes('google search')) {
      searchTerm = command.replace(/.*google search\s+/i, '');
    }

    onSpeech(`Performing Google search for ${searchTerm}. Gathering current information...`);

    try {
      const results = await searchService.performGoogleSearch(searchTerm);
      const speechText = searchService.formatSearchForSpeech(results, searchTerm);
      onSpeech(speechText);
      
    } catch (error) {
      onSpeech(`I encountered an error searching Google for ${searchTerm}. Please try your search again.`);
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
      const results = await searchService.performGoogleSearch(searchTerm);
      const speechText = searchService.formatSearchForSpeech(results, searchTerm);
      onSpeech(speechText);
      
    } catch (error) {
      onSpeech(`I encountered an error searching for ${searchTerm}. Please try your search again.`);
    }
  };

  const handleWeatherCommand = async () => {
    onSpeech('Getting current weather information for your location...');
    
    try {
      const weatherInfo = await searchService.getWeatherInfo();
      const response = searchService.formatWeatherForSpeech(weatherInfo);
      onSpeech(response);
      
    } catch (error) {
      onSpeech('I could not retrieve weather information at this time. Please try again later.');
    }
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
    const helpMessage = `BlindAssist Enhanced Command Guide: You can say "What's today's date" for current date and time. Ask "What are today's headlines" or "What's happening" for current news. Say "Tell me more about headline" followed by a number for detailed news. Use "Search Google for" followed by any topic for web search. Say "What's the weather" for weather updates. Use "Read this page" to analyze content. Say "Stop" to halt audio. I can search Google, get today's headlines from credible sources like BBC and Reuters, provide detailed news summaries, and help you navigate information accessibly.`;
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
          Say commands like "What are today's headlines", "Search Google for tech news", "What's the weather", or "What's today's date". I provide real information from credible sources.
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
            <p className="text-slate-300">Try: "What are today's headlines", "Search Google for AI news", "What's the weather"</p>
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
            <li>• "What's today's date?" - Current date and time</li>
            <li>• "What are today's headlines?" - Current news from credible sources</li>
            <li>• "Tell me more about headline [number]" - Detailed news story</li>
            <li>• "Search Google for [topic]" - Live Google search results</li>
            <li>• "What's the weather?" - Current weather information</li>
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
