import React from 'react';
import { Boxes } from 'lucide-react';

const Logo = () => {
  return (
    <div className="flex items-center space-x-2">
      <Boxes className="h-6 w-6 text-primary" />
      <span className="font-bold text-lg">ToolHub</span>
    </div>
  );
};

export default Logo;