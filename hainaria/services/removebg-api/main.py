from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import Response
import uvicorn
from rembg import remove
import io
from PIL import Image

app = FastAPI(title="Hainaria RemoveBG Service")

@app.post("/removebg")
async def remove_background(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        input_image = await file.read()
        output_image = remove(input_image)
        
        # Optimize output
        img = Image.open(io.BytesIO(output_image)).convert("RGBA")
        output_buffer = io.BytesIO()
        img.save(output_buffer, format="PNG", optimize=True)
        
        return Response(content=output_buffer.getvalue(), media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
