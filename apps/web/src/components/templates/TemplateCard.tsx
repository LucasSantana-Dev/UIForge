'use client';

import { Star, Eye, Code } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  framework: string;
  componentLibrary: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  preview: string;
  usage: number;
  rating: number;
  createdAt: string;
  code?: string;
  isOfficial: boolean;
}

interface TemplateCardProps {
  template: Template;
  onUseTemplate: (template: Template) => void;
  onPreview: (template: Template) => void;
}

export function TemplateCard({ template, onUseTemplate, onPreview }: TemplateCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-surface-1 text-text-primary';
    }
  };

  const templateWithCode = {
    ...template,
    code:
      template.code ||
      `// ${template.name}\nexport default function ${template.name.replace(/\s+/g, '')}() {\n  return <div>${template.name}</div>;\n}`,
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight">{template.name}</CardTitle>
            <CardDescription className="text-sm mt-1 line-clamp-2">
              {template.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{template.framework}</Badge>
            <Badge variant="outline">{template.componentLibrary}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor(template.difficulty)}>{template.difficulty}</Badge>
            <span className="text-xs text-muted-foreground">{template.category}</span>
          </div>

          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{template.rating}</span>
            </div>
            <span>{template.usage} uses</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <div className="flex gap-2 w-full">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPreview(templateWithCode)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
          <Button size="sm" onClick={() => onUseTemplate(templateWithCode)} className="flex-1">
            <Code className="w-4 h-4 mr-1" />
            Use Template
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
