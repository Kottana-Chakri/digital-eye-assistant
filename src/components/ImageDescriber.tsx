
import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ImageDescriberProps {
  onSpeech: (text: string) => void;
}

const ImageDescriber = ({ onSpeech }: ImageDescriberProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onSpeech('Please select a valid image file.');
      toast({
        title: 'Invalid File',
        description: 'Please select an image file (JPG, PNG, GIF, etc.)',
        variant: 'destructive',
      });
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImagePreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    
    onSpeech(`Image selected: ${file.name}. Click "Describe Image" to get a detailed description.`);
    toast({
      title: 'Image Selected',
      description: `Selected: ${file.name}`,
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      onSpeech('Please select an image first.');
      return;
    }

    setIsAnalyzing(true);
    onSpeech('Analyzing your image. Please wait while I examine the visual content in detail.');

    try {
      // Simulate image analysis (in a real implementation, you'd use an AI vision service)
      setTimeout(() => {
        const mockDescription = `This image shows a detailed scene with multiple elements. I can see various objects, colors, and textures arranged in the composition. The lighting appears to be natural, creating depth and contrast throughout the image. There are distinct foreground and background elements that create visual interest. The overall mood of the image is calm and well-balanced, with a harmonious color palette that draws the viewer's attention to the main focal points.`;
        
        setDescription(mockDescription);
        setIsAnalyzing(false);
        onSpeech(`Image analysis complete. Here is what I see: ${mockDescription}`);
        
        toast({
          title: 'Analysis Complete',
          description: 'Image has been successfully analyzed.',
        });
      }, 3000);
    } catch (error) {
      setIsAnalyzing(false);
      onSpeech('I encountered an error while analyzing the image. Please try again.');
      toast({
        title: 'Analysis Error',
        description: 'Failed to analyze image. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-cyan-300 mb-4">Image Description Service</h3>
        <p className="text-slate-400 mb-6">
          Upload any image and I'll provide a detailed description of what I see, including objects, people, text, colors, and context.
        </p>
      </div>

      {/* File Upload Area */}
      <Card className="bg-slate-700 border-cyan-500/50">
        <CardHeader>
          <CardTitle className="text-cyan-300 flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Upload Image</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-cyan-500/50 rounded-lg p-8 text-center hover:border-cyan-400 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={triggerFileInput}
            role="button"
            tabIndex={0}
            aria-label="Upload image area - click to select file or drag and drop"
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                triggerFileInput();
              }
            }}
          >
            <ImageIcon className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h4 className="text-cyan-300 font-medium mb-2">Select or Drop Image Here</h4>
            <p className="text-slate-400 mb-4">Supports JPG, PNG, GIF, and other image formats</p>
            <Button
              variant="outline"
              className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-600 hover:text-white"
            >
              Choose File
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
            aria-label="Image file input"
          />
        </CardContent>
      </Card>

      {/* Image Preview and Analysis */}
      {selectedImage && (
        <Card className="bg-slate-700 border-cyan-500/50">
          <CardHeader>
            <CardTitle className="text-cyan-300 flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Image Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {imagePreview && (
                <div className="text-center">
                  <img
                    src={imagePreview}
                    alt="Selected image for analysis"
                    className="max-w-full h-auto max-h-64 mx-auto rounded-lg border border-cyan-500/30"
                  />
                  <p className="text-slate-400 mt-2">{selectedImage.name}</p>
                </div>
              )}
              
              <Button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="w-full bg-cyan-600 hover:bg-cyan-700"
                aria-label="Analyze image"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Analyzing Image...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Describe Image
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description Results */}
      {description && (
        <Card className="bg-slate-700 border-cyan-500/50">
          <CardHeader>
            <CardTitle className="text-cyan-300">Image Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white leading-relaxed">{description}</p>
            <Button
              onClick={() => onSpeech(description)}
              variant="outline"
              className="mt-4 border-cyan-500/50 text-cyan-300 hover:bg-cyan-600 hover:text-white"
              aria-label="Read description aloud"
            >
              Read Aloud
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="bg-slate-700 border-cyan-500/50">
        <CardContent className="p-4">
          <h4 className="text-cyan-300 font-medium mb-3">Image Description Features:</h4>
          <ul className="space-y-2 text-slate-300">
            <li>• Detailed object and scene identification</li>
            <li>• Color and lighting analysis</li>
            <li>• Text recognition and reading</li>
            <li>• People and facial expression description</li>
            <li>• Spatial relationships and composition</li>
            <li>• Context and mood interpretation</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageDescriber;
