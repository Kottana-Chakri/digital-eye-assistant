
import React, { useState } from 'react';
import { FileText, Headphones, BarChart3, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ContentAnalyzerProps {
  onSpeech: (text: string) => void;
}

const ContentAnalyzer = ({ onSpeech }: ContentAnalyzerProps) => {
  const [content, setContent] = useState('');
  const [analysis, setAnalysis] = useState<{
    summary: string;
    keyPoints: string[];
    readingTime: string;
    complexity: string;
  } | null>(null);

  const analyzeContent = () => {
    if (!content.trim()) {
      onSpeech('Please enter some text to analyze first.');
      return;
    }

    onSpeech('Analyzing your content. I will provide a summary, key points, and readability assessment.');

    // Simulate content analysis
    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed
    
    const mockAnalysis = {
      summary: `This text contains ${wordCount} words and covers various topics. The main theme appears to focus on information sharing and communication. The content is structured to convey ideas clearly and effectively to the reader.`,
      keyPoints: [
        'Main topic identification and context analysis',
        'Information structure and organization assessment',
        'Communication effectiveness evaluation',
        'Reader engagement and clarity factors'
      ],
      readingTime: `${readingTime} minute${readingTime !== 1 ? 's' : ''}`,
      complexity: wordCount > 500 ? 'Advanced' : wordCount > 200 ? 'Intermediate' : 'Basic'
    };

    setAnalysis(mockAnalysis);
    
    const speechText = `Analysis complete. Summary: ${mockAnalysis.summary} The text has ${mockAnalysis.keyPoints.length} key points and takes approximately ${mockAnalysis.readingTime} to read. Complexity level is ${mockAnalysis.complexity}.`;
    onSpeech(speechText);
  };

  const readFullContent = () => {
    if (!content.trim()) {
      onSpeech('No content to read. Please enter some text first.');
      return;
    }
    onSpeech(`Reading full content: ${content}`);
  };

  const readSummary = () => {
    if (!analysis) {
      onSpeech('Please analyze the content first to generate a summary.');
      return;
    }
    onSpeech(`Summary: ${analysis.summary}`);
  };

  const readKeyPoints = () => {
    if (!analysis) {
      onSpeech('Please analyze the content first to identify key points.');
      return;
    }
    const pointsText = analysis.keyPoints.map((point, index) => `Point ${index + 1}: ${point}`).join('. ');
    onSpeech(`Key points: ${pointsText}`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-cyan-300 mb-4">Content Analysis Assistant</h3>
        <p className="text-slate-400 mb-6">
          Paste any text content and I'll provide summaries, key points, readability analysis, and audio reading.
        </p>
      </div>

      {/* Content Input */}
      <Card className="bg-slate-700 border-cyan-500/50">
        <CardHeader>
          <CardTitle className="text-cyan-300 flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Content Input</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste your text content here for analysis..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-32 bg-slate-800 border-cyan-500/50 text-white placeholder-slate-400 focus:border-cyan-400 resize-none"
            aria-label="Content input area"
          />
          
          <div className="flex space-x-2 mt-4">
            <Button
              onClick={analyzeContent}
              className="bg-cyan-600 hover:bg-cyan-700"
              aria-label="Analyze content"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analyze Content
            </Button>
            
            <Button
              onClick={readFullContent}
              variant="outline"
              className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-600 hover:text-white"
              aria-label="Read full content aloud"
            >
              <Headphones className="w-4 h-4 mr-2" />
              Read Aloud
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card className="bg-slate-700 border-cyan-500/50">
          <CardHeader>
            <CardTitle className="text-cyan-300 flex items-center space-x-2">
              <Lightbulb className="w-5 h-5" />
              <span>Analysis Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-slate-800">
                <TabsTrigger value="summary" className="data-[state=active]:bg-cyan-600">
                  Summary
                </TabsTrigger>
                <TabsTrigger value="keypoints" className="data-[state=active]:bg-cyan-600">
                  Key Points
                </TabsTrigger>
                <TabsTrigger value="stats" className="data-[state=active]:bg-cyan-600">
                  Statistics
                </TabsTrigger>
                <TabsTrigger value="actions" className="data-[state=active]:bg-cyan-600">
                  Actions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-4">
                <div className="space-y-3">
                  <p className="text-white leading-relaxed">{analysis.summary}</p>
                  <Button
                    onClick={readSummary}
                    size="sm"
                    variant="outline"
                    className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-600 hover:text-white"
                  >
                    Read Summary
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="keypoints" className="mt-4">
                <div className="space-y-3">
                  <ul className="space-y-2">
                    {analysis.keyPoints.map((point, index) => (
                      <li key={index} className="text-white flex items-start space-x-2">
                        <span className="text-cyan-400 font-semibold">{index + 1}.</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={readKeyPoints}
                    size="sm"
                    variant="outline"
                    className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-600 hover:text-white"
                  >
                    Read Key Points
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="stats" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-cyan-300 font-medium mb-1">Reading Time</h4>
                    <p className="text-white text-lg">{analysis.readingTime}</p>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-cyan-300 font-medium mb-1">Complexity</h4>
                    <p className="text-white text-lg">{analysis.complexity}</p>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-cyan-300 font-medium mb-1">Word Count</h4>
                    <p className="text-white text-lg">{content.trim().split(/\s+/).length}</p>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-cyan-300 font-medium mb-1">Key Points</h4>
                    <p className="text-white text-lg">{analysis.keyPoints.length}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="actions" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Button
                    onClick={readFullContent}
                    variant="outline"
                    className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-600 hover:text-white"
                  >
                    Read Full Content
                  </Button>
                  <Button
                    onClick={readSummary}
                    variant="outline"
                    className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-600 hover:text-white"
                  >
                    Read Summary
                  </Button>
                  <Button
                    onClick={readKeyPoints}
                    variant="outline"
                    className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-600 hover:text-white"
                  >
                    Read Key Points
                  </Button>
                  <Button
                    onClick={() => onSpeech(`This content has ${analysis.readingTime} reading time and ${analysis.complexity} complexity level.`)}
                    variant="outline"
                    className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-600 hover:text-white"
                  >
                    Read Statistics
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Usage Guide */}
      <Card className="bg-slate-700 border-cyan-500/50">
        <CardContent className="p-4">
          <h4 className="text-cyan-300 font-medium mb-3">Content Analysis Features:</h4>
          <ul className="space-y-2 text-slate-300">
            <li>• Intelligent text summarization</li>
            <li>• Key point extraction and organization</li>
            <li>• Reading time estimation</li>
            <li>• Complexity and readability assessment</li>
            <li>• Full content audio reading</li>
            <li>• Structured information presentation</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentAnalyzer;
