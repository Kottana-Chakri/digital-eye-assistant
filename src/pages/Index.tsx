
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Search, Eye, FileText, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import VoiceControl from '@/components/VoiceControl';
import ContentAnalyzer from '@/components/ContentAnalyzer';
import ImageDescriber from '@/components/ImageDescriber';
import WebNavigator from '@/components/WebNavigator';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [activeMode, setActiveMode] = useState<'voice' | 'web' | 'image' | 'text'>('voice');
  const [isListening, setIsListening] = useState(false);
  const [currentContent, setCurrentContent] = useState('');
  const { toast } = useToast();

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const announceMode = (mode: string) => {
    const modeMessages = {
      voice: 'Voice control mode activated. Speak your commands.',
      web: 'Web navigation mode activated. I can help you browse websites.',
      image: 'Image description mode activated. Upload an image for detailed description.',
      text: 'Text analysis mode activated. Paste or type content for analysis.'
    };
    speakText(modeMessages[mode as keyof typeof modeMessages]);
  };

  useEffect(() => {
    // Welcome message
    setTimeout(() => {
      speakText('Welcome to BlindAssist, your AI-powered accessibility companion. I am ready to help you navigate the digital world.');
    }, 500);
  }, []);

  const handleModeChange = (mode: 'voice' | 'web' | 'image' | 'text') => {
    setActiveMode(mode);
    announceMode(mode);
    toast({
      title: `${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`,
      description: `Switched to ${mode} mode`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-cyan-500/30 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Eye className="w-8 h-8 text-cyan-400" />
              <h1 className="text-3xl font-bold text-cyan-400">BlindAssist</h1>
            </div>
            <p className="text-slate-300 text-lg hidden md:block">Your AI Digital Navigation Companion</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {/* Mode Selection */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-cyan-300">Choose Your Assistance Mode</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => handleModeChange('voice')}
              variant={activeMode === 'voice' ? 'default' : 'outline'}
              className={`h-24 flex flex-col items-center justify-center space-y-2 text-lg font-medium transition-all duration-200 ${
                activeMode === 'voice' 
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-400' 
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-cyan-500/50'
              }`}
              aria-label="Voice Control Mode"
            >
              <Mic className="w-6 h-6" />
              <span>Voice Control</span>
            </Button>

            <Button
              onClick={() => handleModeChange('web')}
              variant={activeMode === 'web' ? 'default' : 'outline'}
              className={`h-24 flex flex-col items-center justify-center space-y-2 text-lg font-medium transition-all duration-200 ${
                activeMode === 'web' 
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-400' 
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-cyan-500/50'
              }`}
              aria-label="Web Navigation Mode"
            >
              <Globe className="w-6 h-6" />
              <span>Web Navigation</span>
            </Button>

            <Button
              onClick={() => handleModeChange('image')}
              variant={activeMode === 'image' ? 'default' : 'outline'}
              className={`h-24 flex flex-col items-center justify-center space-y-2 text-lg font-medium transition-all duration-200 ${
                activeMode === 'image' 
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-400' 
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-cyan-500/50'
              }`}
              aria-label="Image Description Mode"
            >
              <Eye className="w-6 h-6" />
              <span>Image Description</span>
            </Button>

            <Button
              onClick={() => handleModeChange('text')}
              variant={activeMode === 'text' ? 'default' : 'outline'}
              className={`h-24 flex flex-col items-center justify-center space-y-2 text-lg font-medium transition-all duration-200 ${
                activeMode === 'text' 
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-400' 
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-cyan-500/50'
              }`}
              aria-label="Text Analysis Mode"
            >
              <FileText className="w-6 h-6" />
              <span>Text Analysis</span>
            </Button>
          </div>
        </section>

        {/* Active Mode Content */}
        <section className="mb-8">
          <Card className="bg-slate-800 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-300 flex items-center space-x-2">
                {activeMode === 'voice' && <Mic className="w-5 h-5" />}
                {activeMode === 'web' && <Globe className="w-5 h-5" />}
                {activeMode === 'image' && <Eye className="w-5 h-5" />}
                {activeMode === 'text' && <FileText className="w-5 h-5" />}
                <span>{activeMode.charAt(0).toUpperCase() + activeMode.slice(1)} Assistant</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeMode === 'voice' && <VoiceControl onSpeech={speakText} />}
              {activeMode === 'web' && <WebNavigator onSpeech={speakText} />}
              {activeMode === 'image' && <ImageDescriber onSpeech={speakText} />}
              {activeMode === 'text' && <ContentAnalyzer onSpeech={speakText} />}
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-cyan-300">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-800 border-cyan-500/30 hover:border-cyan-400 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h3 className="font-medium text-cyan-300">Emergency Stop</h3>
                    <p className="text-sm text-slate-400">Stop all audio output</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-cyan-500/30 hover:border-cyan-400 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Search className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h3 className="font-medium text-cyan-300">Quick Search</h3>
                    <p className="text-sm text-slate-400">Search the web instantly</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-cyan-500/30 hover:border-cyan-400 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h3 className="font-medium text-cyan-300">Help & Commands</h3>
                    <p className="text-sm text-slate-400">Learn voice commands</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Accessibility Info */}
      <footer className="bg-slate-800 border-t border-cyan-500/30 p-6 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-400">
            BlindAssist is designed with accessibility in mind. Use Tab to navigate, Enter to activate, and Escape to cancel operations.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
