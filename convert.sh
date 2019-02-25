#!/bin/bash
BPATH=$1  # Path to directory containing PDFs.
OPATH=$2  # Path to output directory.

if [ ! -d "$OPATH" ]; then
    mkdir -p "$OPATH"
fi

for FILEPATH in $BPATH*.pdf; do
    OUTFILE=$OPATH$(basename $FILEPATH)
    touch "$OUTFILE".txt
    echo -n "Attempting OCR extraction on "$FILEPATH"... "

    #Convert PDF to TIFF ImageMagick
    #convert -density 300 "$FILEPATH" -depth 8 -strip -background white \
    #        -alpha off ./temp.tiff > /dev/null 2>&1


    #GhostScript seems to be MUCH faster at conversion
    gs -dNOPAUSE -q -r300 -sDEVICE=tiffscaled24 -sCompression=lzw -dFirstPage=3 -dBATCH -sOutputFile=temp.tiff "$FILEPATH" > /dev/null 2>&1

    #Convert TIFF to txt
    tesseract -l eng ./temp.tiff "$OUTFILE" txt > /dev/null 2>&1

    rm ./temp.tiff
    echo "extracted!"
done