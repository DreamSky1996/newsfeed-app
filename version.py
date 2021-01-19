
with open(".env", "r") as f:
    lines = list(tuple(f))
    f.close()

version_index = [index for index in range(len(lines)) if lines[index].startswith("REACT_APP_VERSION")][0]

version = lines[version_index]
version = version.split(" = ")[1]
version = int(version) + 1

lines[version_index] = f"REACT_APP_VERSION = {version}"

with open(".env", "w") as f:
    f.write(''.join(str(line) for line in lines))
    f.close()