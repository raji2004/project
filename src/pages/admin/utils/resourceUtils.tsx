import { FileText, Upload, Download } from 'lucide-react';
import React from 'react';

export function getResourceIcon(type: 'pdf' | 'video' | 'link') {
  switch (type) {
    case 'pdf':
      return <FileText className="h-6 w-6 text-purple-500" />;
    case 'video':
      return <Upload className="h-6 w-6 text-blue-500" />;
    case 'link':
      return <Download className="h-6 w-6 text-green-500" />;
    default:
      return null;
  }
} 