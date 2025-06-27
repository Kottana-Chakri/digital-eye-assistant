
import React, { useState } from 'react';
import { Search, Globe, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface WebNavigatorProps {
  onSpeech: (text: string) => void;
}

const WebNavigator = ({ onSpeech }: WebNavigatorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { toast } = useToast();

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      onSpeech('Please enter a search query first.');
      return;
    }

    setIsSearching(true);
    onSpeech(`Searching for ${searchQuery}. Please wait while I find relevant information.`);

    try {
      // Simulate search results (in a real implementation, you'd use a search API)
      setTimeout(() => {
        const mockResults = [
          {
            title: `${searchQuery} - Wikipedia`,
            url: `https://en.wikipedia.org/wiki/${searchQuery.replace(/\s+/g, '_')}`,
            description: `Learn about ${searchQuery} on Wikipedia with comprehensive information and references.`
          },
          {
            title: `${searchQuery} News - Latest Updates`,
            url: `https://news.google.com/search?q=${encodeURIComponent(searchQuery)}`,
            description: `Latest news and updates about ${searchQuery} from various sources.`
          },
          {
            title: `${searchQuery} Guide and Resources`,
            url: `https://example.com/${searchQuery.replace(/\s+/g, '-')}`,
            description: `Comprehensive guide and resources related to ${searchQuery}.`
          }
        ];

        setSearchResults(mockResults);
        setIsSearching(false);
        
        const resultText = `I found ${mockResults.length} results for ${searchQuery}. The top result is ${mockResults[0].title}. ${mockResults[0].description}`;
        onSpeech(resultText);
        
        toast({
          title: 'Search Completed',
          description: `Found ${mockResults.length} results for "${searchQuery}"`,
        });
      }, 2000);
    } catch (error) {
      setIsSearching(false);
      onSpeech('I encountered an error while searching. Please try again.');
      toast({
        title: 'Search Error',
        description: 'Failed to perform search. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const readResult = (result: any, index: number) => {
    const text = `Result ${index + 1}: ${result.title}. ${result.description}. URL: ${result.url}`;
    onSpeech(text);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-cyan-300 mb-4">Web Navigation Assistant</h3>
        <p className="text-slate-400 mb-6">
          Search the web and get accessible descriptions of content. I'll help you navigate websites and understand their structure.
        </p>
      </div>

      {/* Search Interface */}
      <Card className="bg-slate-700 border-cyan-500/50">
        <CardHeader>
          <CardTitle className="text-cyan-300 flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Web Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter your search query..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-slate-800 border-cyan-500/50 text-white placeholder-slate-400 focus:border-cyan-400"
              aria-label="Search query input"
            />
            <Button
              onClick={performSearch}
              disabled={isSearching}
              className="bg-cyan-600 hover:bg-cyan-700"
              aria-label="Perform search"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card className="bg-slate-700 border-cyan-500/50">
          <CardHeader>
            <CardTitle className="text-cyan-300 flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Search Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="border border-slate-600 rounded-lg p-4 hover:border-cyan-500/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-cyan-300 font-medium text-lg">{result.title}</h4>
                    <Button
                      onClick={() => readResult(result, index)}
                      size="sm"
                      variant="outline"
                      className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-600 hover:text-white ml-2"
                      aria-label={`Read result ${index + 1}`}
                    >
                      Read
                    </Button>
                  </div>
                  <p className="text-slate-300 mb-3">{result.description}</p>
                  <div className="flex items-center text-sm text-slate-400">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    <span className="truncate">{result.url}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Tips */}
      <Card className="bg-slate-700 border-cyan-500/50">
        <CardContent className="p-4">
          <h4 className="text-cyan-300 font-medium mb-3">Navigation Tips:</h4>
          <ul className="space-y-2 text-slate-300">
            <li>• Use the search bar to find information on any topic</li>
            <li>• Click "Read" buttons to hear content descriptions</li>
            <li>• Press Tab to navigate between elements</li>
            <li>• Press Enter on the search field to start searching</li>
            <li>• I'll announce important page elements and structure</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebNavigator;
