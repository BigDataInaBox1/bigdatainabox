from pathlib import Path
from PIL import Image, ImageOps

workspace = Path(__file__).resolve().parents[2]
desktop = Path('C:/Users/iCarl/Desktop')
output = workspace / 'public/assets/home'
output.mkdir(parents=True, exist_ok=True)

photos = {
    'hero-farm': ('background for hero.jpg', [640, 1019]),
    'farm-panorama': ('pexels-antonio-di-giacomo-64078839-32370506.jpg', [640, 1200, 1920]),
    'corn-rows': ('pexels-nayla-charo-3181636-12236025.jpg', [640, 1200, 1600]),
    'harvest': ('pexels-kurt-hudspeth-1805942791-28609916.jpg', [640, 1200, 1600]),
    'tractor-field': ('pexels-nc-farm-bureau-mark-18900457.jpg', [640, 1200, 1920]),
    'soybean-rows': ('pexels-sammccool47-33786765.jpg', [480, 800, 1200]),
}

for name, (source, widths) in photos.items():
    with Image.open(desktop / source) as original:
        photo = ImageOps.exif_transpose(original).convert('RGB')
        for width in widths:
            height = round(photo.height * width / photo.width)
            photo.resize((width, height), Image.Resampling.LANCZOS).save(
                output / f'{name}-{width}.webp', 'WEBP', quality=82, method=6
            )
        print(f'{name}: {photo.width}x{photo.height}')

with Image.open(workspace / 'scratch/home-media/hero-frame.png') as frame:
    frame.save(output / 'hero-poster.webp', 'WEBP', quality=88, method=6)
    alpha = frame.getchannel('A')
    print(f'Hero alpha range: {alpha.getextrema()}, corner: {alpha.getpixel((0, 0))}')

for asset in sorted(output.glob('*.webp')):
    print(f'{asset.name}: {asset.stat().st_size / 1024:.0f} KB')
