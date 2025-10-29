import os

# Root folder where your HTML files are located
root_folder = "."  # <-- change this

# Script line to insert
script_line = '  <script src="../common.js"></script>\n'

# Walk through all files in the directory recursively
for dirpath, dirnames, filenames in os.walk(root_folder):
    for filename in filenames:
        if filename.endswith(".html") and filename != "index.html":
            file_path = os.path.join(dirpath, filename)
            
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Skip if the script is already present
            if "../common.js" in content:
                continue

            # Insert script before </body>
            if "</body>" in content:
                new_content = content.replace("</body>", f"<br/><br/><br/>{script_line}</body>", 1)
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"✅ Updated: {file_path}")
            else:
                print(f"⚠️ Skipped (no </body>): {file_path}")

print("✅ All eligible HTML files updated.")