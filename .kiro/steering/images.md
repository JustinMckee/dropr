---
inclusion: manual
---

# Images

## Philosophy

Images sell drops. High-quality, optimized images create trust, showcase products, and drive conversions. Balance quality with performance—serve responsive images via CDN, lazy load below the fold, and use modern formats (WebP, AVIF). Moderate images for inappropriate content. Provide clear upload guidelines and real-time feedback. Images should load fast, look great, and be accessible.

## Images Checklist

**Upload Requirements:**
- [ ] Minimum dimensions (800x600px)
- [ ] Maximum file size (5MB)
- [ ] Supported formats (JPEG, PNG, WebP)
- [ ] Aspect ratio guidelines (16:9 for drops, 1:1 for avatars)
- [ ] Image validation on upload
- [ ] Real-time preview

**Optimization:**
- [ ] Automatic WebP conversion
- [ ] Multiple size variants generated
- [ ] Responsive image serving
- [ ] Lazy loading below fold
- [ ] CDN delivery
- [ ] Image compression

**Moderation:**
- [ ] Automated NSFW detection
- [ ] Violence/gore detection
- [ ] Manual review queue
- [ ] Rejection reasons provided
- [ ] Appeal process

**Accessibility:**
- [ ] Alt text required
- [ ] Descriptive file names
- [ ] Color contrast checking
- [ ] Text overlay readability

**Performance:**
- [ ] Next.js Image component
- [ ] Priority loading for above-fold
- [ ] Blur placeholder
- [ ] Skeleton loading states
- [ ] Cache headers configured


## Image Requirements

### Drop Cover Images

**Dimensions:**
- Minimum: 800x600px
- Recommended: 1600x1200px
- Maximum: 4000x3000px
- Aspect Ratio: 16:9 (preferred) or 4:3

**File Size:**
- Maximum: 5MB
- Recommended: < 2MB for faster uploads

**Formats:**
- JPEG (recommended for photos)
- PNG (for graphics with transparency)
- WebP (modern browsers)

**Quality Guidelines:**
- Well-lit, clear focus
- Product centered in frame
- Minimal distracting background
- No watermarks (except curator branding)
- No text overlays (use description instead)
- Show product scale/context

### Avatar Images

**Dimensions:**
- Minimum: 200x200px
- Recommended: 400x400px
- Maximum: 2000x2000px
- Aspect Ratio: 1:1 (square)

**File Size:**
- Maximum: 2MB

### Banner Images

**Dimensions:**
- Minimum: 1200x300px
- Recommended: 1920x480px
- Maximum: 3840x960px
- Aspect Ratio: 16:4 or 4:1

**File Size:**
- Maximum: 3MB


## Image Upload Component

```typescript
// components/images/ImageUpload.tsx
'use client'

import { useState } from 'react';
import { uploadImage } from '@/lib/images/upload';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  aspectRatio?: string;
  minWidth?: number;
  minHeight?: number;
  maxSize?: number; // MB
}

export function ImageUpload({
  onUpload,
  aspectRatio = '16:9',
  minWidth = 800,
  minHeight = 600,
  maxSize = 5,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setError(null);
    
    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Invalid file type. Use JPEG, PNG, or WebP.');
      return;
    }
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File too large. Maximum size is ${maxSize}MB.`);
      return;
    }
    
    // Validate dimensions
    const dimensions = await getImageDimensions(file);
    if (dimensions.width < minWidth || dimensions.height < minHeight) {
      setError(`Image too small. Minimum ${minWidth}x${minHeight}px.`);
      return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    
    // Upload
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onUpload(url);
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="image-upload">
      {preview ? (
        <div className="preview">
          <img src={preview} alt="Preview" />
          <button onClick={() => setPreview(null)}>Change</button>
        </div>
      ) : (
        <label className="upload-area">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <div className="upload-prompt">
            <UploadIcon />
            <p>Click to upload or drag and drop</p>
            <small>
              {aspectRatio} • Min {minWidth}x{minHeight}px • Max {maxSize}MB
            </small>
          </div>
        </label>
      )}
      
      {error && <p className="error">{error}</p>}
      {uploading && <p className="uploading">Uploading...</p>}
    </div>
  );
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.src = URL.createObjectURL(file);
  });
}
```

## Image Upload Server Action

```typescript
// lib/images/upload.ts
'use server'

import { put } from '@vercel/blob';
import { requireAuth } from '@/lib/auth';

export async function uploadImage(file: File): Promise<string> {
  const session = await requireAuth();
  
  // Upload to Vercel Blob Storage
  const blob = await put(`images/${session.user.id}/${Date.now()}-${file.name}`, file, {
    access: 'public',
  });
  
  return blob.url;
}
```

## Image Optimization

### Next.js Image Component

```typescript
// Always use Next.js Image component for optimization
import Image from 'next/image';

export function DropCard({ drop }: { drop: Drop }) {
  return (
    <div className="drop-card">
      <Image
        src={drop.coverImage}
        alt={drop.title}
        width={800}
        height={600}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={false} // Only true for above-fold images
        placeholder="blur"
        blurDataURL={drop.coverImageBlur}
      />
    </div>
  );
}
```

### Generate Blur Placeholder

```typescript
// lib/images/blur.ts
import sharp from 'sharp';

export async function generateBlurDataURL(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();
  
  const blurBuffer = await sharp(Buffer.from(buffer))
    .resize(10, 10, { fit: 'inside' })
    .blur()
    .toBuffer();
  
  return `data:image/jpeg;base64,${blurBuffer.toString('base64')}`;
}
```

## Image Moderation

```typescript
// lib/images/moderation.ts
export async function moderateImage(imageUrl: string): Promise<{
  safe: boolean;
  scores: {
    adult: number;
    violence: number;
    racy: number;
  };
}> {
  // Use external moderation API (e.g., Google Cloud Vision, AWS Rekognition)
  const response = await fetch('https://moderation-api.example.com/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl }),
  });
  
  const result = await response.json();
  
  return {
    safe: result.adult < 0.3 && result.violence < 0.3,
    scores: {
      adult: result.adult,
      violence: result.violence,
      racy: result.racy,
    },
  };
}
```

## Best Practices

- Use Next.js Image component for automatic optimization
- Serve WebP format with JPEG fallback
- Lazy load images below the fold
- Use blur placeholders for better perceived performance
- Set explicit width/height to prevent layout shift
- Use CDN for image delivery (Vercel Blob, Cloudinary, etc.)
- Compress images before upload (client-side or server-side)
- Generate multiple size variants for responsive serving
- Use descriptive alt text for accessibility
- Moderate images for inappropriate content
- Cache images aggressively (1 year+)
- Use priority loading for above-fold images only
- Provide clear upload guidelines to users
- Show real-time validation feedback
- Handle upload errors gracefully

## Common Mistakes to Avoid

- Not using Next.js Image component
- Serving full-size images to mobile
- No lazy loading
- Missing alt text
- No image compression
- Blocking page load with images
- No error handling for failed uploads
- Accepting any file size
- No dimension validation
- Not moderating user-uploaded images
- Serving images from slow origins
- No responsive image variants
- Missing blur placeholders
- Not caching images properly
