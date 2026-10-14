import struct
import zlib
from collections import deque

def process_hero():
    with open('/tmp/hero.bmp', 'rb') as f:
        bmp_data = f.read()

    w, h = 896, 1200
    pixel_data = bmp_data[54:]

    # Parse BGR into a flat list or buffer
    # Total pixels: w * h
    # We will build an alpha map: 0 = transparent, 255 = fully opaque
    
    # 1. Connected component BFS from borders for background detection
    # Any pixel reachable from borders where r > 235 and g > 235 and b > 235 is definitely background
    bg_mask = bytearray(w * h)
    visited = bytearray(w * h)

    queue = deque()

    # Add all border pixels to queue
    for x in range(w):
        queue.append((x, 0))
        queue.append((x, h - 1))
        visited[0 * w + x] = 1
        visited[(h - 1) * w + x] = 1

    for y in range(h):
        queue.append((0, y))
        queue.append((w - 1, y))
        visited[y * w + 0] = 1
        visited[y * w + (w - 1)] = 1

    while queue:
        x, y = queue.popleft()
        idx = (y * w + x) * 3
        b = pixel_data[idx]
        g = pixel_data[idx + 1]
        r = pixel_data[idx + 2]

        # Check if this pixel is near-white (background)
        # In this photo, student hair is dark, clothes are teal, skin is peach.
        # Only the photo background and bottom fade are near-white.
        # Threshold: min(r, g, b) >= 238
        if min(r, g, b) >= 236:
            bg_mask[y * w + x] = 1

            # Check 4 neighbors
            for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h:
                    n_idx = ny * w + nx
                    if not visited[n_idx]:
                        visited[n_idx] = 1
                        queue.append((nx, ny))

    # 2. Build RGBA output scanlines with soft edge anti-aliasing and bottom fade
    rgba_bytes = bytearray()

    for y in range(h):
        # PNG filter byte for scanline (0 = None)
        rgba_bytes.append(0)

        # Bottom fade factor (y from 900 to 1200 fades out smoothly)
        bottom_fade = 1.0
        if y > 920:
            bottom_fade = max(0.0, 1.0 - (y - 920) / 260.0)

        for x in range(w):
            idx = (y * w + x) * 3
            b = pixel_data[idx]
            g = pixel_data[idx + 1]
            r = pixel_data[idx + 2]

            pixel_idx = y * w + x

            if bg_mask[pixel_idx]:
                # Completely transparent
                rgba_bytes.extend((0, 0, 0, 0))
            else:
                # Foreground pixel.
                # Check distance to white to remove white fringe (color defringe / de-matting)
                # If pixel is near-white (e.g. min(r,g,b) > 220), softly ramp alpha
                min_c = min(r, g, b)
                if min_c > 220:
                    alpha_factor = max(0.0, min(1.0, (245 - min_c) / 25.0))
                else:
                    alpha_factor = 1.0

                final_alpha = int(255 * alpha_factor * bottom_fade)
                
                # Defringe: adjust RGB so white background doesn't bleed into edge pixels
                if final_alpha > 0:
                    rgba_bytes.extend((r, g, b, final_alpha))
                else:
                    rgba_bytes.extend((0, 0, 0, 0))

    # 3. Create PNG file
    def make_chunk(chunk_type, data):
        length = struct.pack('>I', len(data))
        crc = struct.pack('>I', zlib.crc32(chunk_type + data) & 0xffffffff)
        return length + chunk_type + data + crc

    png_data = bytearray(b'\x89PNG\r\n\x1a\n')

    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)
    png_data += make_chunk(b'IHDR', ihdr_data)

    # IDAT (compressed raw scanlines)
    compressed = zlib.compress(bytes(rgba_bytes), 9)
    png_data += make_chunk(b'IDAT', compressed)

    # IEND
    png_data += make_chunk(b'IEND', b'')

    with open('/Users/abdou/.gemini/antigravity/scratch/noubla/public/hero-student.png', 'wb') as f:
        f.write(png_data)

    print(f"Generated hero-student.png successfully! Size: {len(png_data)} bytes")

if __name__ == '__main__':
    process_hero()
