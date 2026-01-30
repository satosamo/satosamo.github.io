with open("full_code.txt", "r") as infile, open("full_code_no_lines.txt", "w") as outfile:
    for line in infile:
        if line.strip():
            outfile.write(line)
