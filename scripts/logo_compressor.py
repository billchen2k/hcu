import os
import PIL
import warnings
logos = os.listdir('public/assets/logo')

for logo in logos:
    if logo[-3:] == 'png':
        if (size := os.stat(f'public/assets/logo/{logo}').st_size) > 1024 * 100:
            print(f'{logo} is too large: {(size / 1024):.2f} KB')
            image = PIL.Image.open(f'public/assets/logo/{logo}')
            image.thumbnail((300, 300))
            image.save(f'public/assets/logo/{logo}')
            print(f"{logo}'s new size: {os.stat(f'public/assets/logo/{logo}').st_size / 1024:.2f} KB")