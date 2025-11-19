#!/bin/bash
# Script to help identify files that need import updates

echo "Files with inline theme definitions:"
grep -r "const theme = createTheme" src/screens --include="*.jsx" | cut -d: -f1 | sort -u

echo ""
echo "Files with inline MobileShell:"
grep -r "^function MobileShell" src/screens --include="*.jsx" | cut -d: -f1 | sort -u

echo ""
echo "Files with inline MapPicker:"
grep -r "^function MapPicker" src/screens --include="*.jsx" | cut -d: -f1 | sort -u

echo ""
echo "Files with inline Stat:"
grep -r "^function Stat" src/screens --include="*.jsx" | cut -d: -f1 | sort -u
