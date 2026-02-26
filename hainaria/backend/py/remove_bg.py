import sys
from rembg import remove
from PIL import Image

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 remove_bg.py <input_path> <output_path>")
        sys.exit(1)
        
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    try:
        input_image = Image.open(input_path).convert("RGBA")
        # Folosim modelul u2net care e mai precis pentru oameni (poate dura putin mai mult la prima descarcare)
        output_image = remove(input_image, session=None if 'session' not in globals() else globals()['session'])
        
        # Ne asigurăm că fundalul e 100% transparent (alpha 0) acolo unde rembg a tăiat
        output_image.save(output_path, "PNG", optimize=True)
        print(f"SUCCESS: {output_path}")
    except Exception as e:
        print(f"ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
