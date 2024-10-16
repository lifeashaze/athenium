export interface Language {
  id: string;
  name: string;
  version: string;
}

export const languages: Language[] = [
  { id: 'c', name: 'C', version: '10.2.0' },
  { id: 'cpp', name: 'C++', version: '11.2.0' },
  { id: 'python', name: 'Python', version: '3.10.0' },
  { id: 'javascript', name: 'JavaScript', version: '18.15.0' },
  { id: 'java', name: 'Java', version: '17.0.6' },
  { id: 'rust', name: 'Rust', version: '1.68.2' },
  // Add more languages as needed
];

export const defaultCodeTemplates: Record<string, string> = {
  c: `#include <stdio.h>

int main() {
    // Your code here
    return 0;
}`,
  cpp: `#include <iostream>

int main() {
    // Your code here
    return 0;
}`,
  python: `# Your code here
`,
  javascript: `// Your code here
`,
  java: `public class Main {
    public static void main(String[] args) {
        // Your code here
    }
}`,
  rust: `fn main() {
    // Your code here
}`,
  // Add more default code templates as needed
};

export const getDefaultCode = (languageId: string): string => {
  return defaultCodeTemplates[languageId] || '// No default template available for this language';
};
