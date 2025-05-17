/// <reference types="react" />

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // Add any custom attributes here
  }
}

declare module '@mui/material/styles' {
  interface Theme {
    // Add any custom theme properties here
  }
  interface ThemeOptions {
    // Add any custom theme options here
  }
}

declare module '@mui/material/*' {
  const content: any;
  export default content;
  export * from '@mui/material';
}

declare module '@mui/icons-material/*' {
  const content: any;
  export default content;
}

declare module '@mui/material' {
  export * from '@mui/material';
}

declare module '@mui/icons-material' {
  export * from '@mui/icons-material';
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
} 