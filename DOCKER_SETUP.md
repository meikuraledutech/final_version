# Code Execution Containers Setup

Safe, isolated code execution for 4 programming languages using Docker.

## Quick Start

```bash
# Start containers
docker-compose up -d

# Verify all running
docker-compose ps

# Stop containers
docker-compose down
```

## Architecture

Simple container setup with shared volume for code files:

```
docker-compose.yml
├── java-runner (eclipse-temurin:17-jdk-focal)
├── python-runner (python:3.11-slim)
├── c-runner (gcc:11)
└── cpp-runner (gcc:11)
     ↓
Shared Volume: /tmp/submissions
```

## Execution Flow

1. Backend writes code to `/tmp/submissions/file.ext`
2. Backend executes with `docker exec container-name command`
3. Capture output and stderr
4. Clean up temporary files

## Resource Limits

Each container has:
- **CPU:** 0.5 core limit (0.25 reserved)
- **Memory:** 128MB limit (64MB reserved)
- **Timeout:** Handled by backend (3 seconds recommended)

## Usage Examples

### Python
```bash
# Write code
cat > /tmp/submissions/script.py << 'EOF'
print("Hello!")
x = int(input())
print(x * 2)
EOF

# Execute
docker exec -i python-runner python /code/script.py <<< "5"
# Output: Hello!
#         10
```

### Java
```bash
# Write code
cat > /tmp/submissions/Main.java << 'EOF'
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
    }
}
EOF

# Execute
docker exec java-runner bash -c "cd /code && javac Main.java && java Main"
# Output: Hello from Java!
```

### C
```bash
# Write code
cat > /tmp/submissions/main.c << 'EOF'
#include <stdio.h>
int main() {
    printf("Hello from C!\n");
    return 0;
}
EOF

# Execute
docker exec c-runner bash -c "cd /code && gcc main.c -o main && ./main"
# Output: Hello from C!
```

### C++
```bash
# Write code
cat > /tmp/submissions/main.cpp << 'EOF'
#include <iostream>
int main() {
    std::cout << "Hello from C++!" << std::endl;
    return 0;
}
EOF

# Execute
docker exec cpp-runner bash -c "cd /code && g++ main.cpp -o main && ./main"
# Output: Hello from C++!
```

## Backend Integration

Create an execution endpoint in your Express backend:

```javascript
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const executeCode = async (req, res) => {
  try {
    const { code, language, input, timeout = 3 } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language required' });
    }

    const containerMap = {
      python: 'python-runner',
      java: 'java-runner',
      c: 'c-runner',
      cpp: 'cpp-runner'
    };

    const container = containerMap[language];
    if (!container) {
      return res.status(400).json({ error: 'Unsupported language' });
    }

    // Generate unique filename
    const fileId = Date.now();
    const ext = { python: 'py', java: 'java', c: 'c', cpp: 'cpp' }[language];
    const filename = `${language}_${fileId}.${ext}`;
    const filepath = path.join('/tmp/submissions', filename);

    // Write code to file
    fs.writeFileSync(filepath, code);

    // Build execution command based on language
    let command;
    if (language === 'python') {
      command = `docker exec -i ${container} python /code/${filename}`;
    } else if (language === 'java') {
      const className = 'Main'; // Assume Main class
      command = `docker exec ${container} bash -c "cd /code && javac ${filename} && java ${className}"`;
    } else if (language === 'c') {
      const outfile = filename.replace('.c', '');
      command = `docker exec ${container} bash -c "cd /code && gcc ${filename} -o ${outfile} && ./${outfile}"`;
    } else if (language === 'cpp') {
      const outfile = filename.replace('.cpp', '');
      command = `docker exec ${container} bash -c "cd /code && g++ ${filename} -o ${outfile} && ./${outfile}"`;
    }

    // Execute with timeout
    const startTime = Date.now();
    exec(command, { timeout: timeout * 1000 }, (error, stdout, stderr) => {
      const executionTime = (Date.now() - startTime) / 1000;

      // Cleanup
      try {
        fs.unlinkSync(filepath);
        // Also cleanup compiled files
        const baseDir = filepath.replace(`.${ext}`, '');
        fs.unlinkSync(baseDir); // For C/C++
      } catch (e) {
        // Ignore cleanup errors
      }

      if (error && error.code === 'ETIMEDOUT') {
        return res.json({
          output: '',
          error: `Execution timeout exceeded (${timeout}s)`,
          executionTime: timeout,
          success: false,
          statusCode: 408
        });
      }

      res.json({
        output: stdout,
        error: stderr || null,
        executionTime: executionTime.toFixed(3),
        success: !error,
        statusCode: 200
      });
    });

    // Send input if provided (for Python)
    if (input && language === 'python') {
      // This would need to be handled differently
    }

  } catch (err) {
    res.status(500).json({
      error: 'Execution failed',
      details: err.message
    });
  }
};
```

## Testing Status

✅ **Python 3.11** - Working
✅ **Java 17** - Working
✅ **C (GCC 11)** - Working
✅ **C++ (G++ 11)** - Working

## File Structure

```
/tmp/submissions/          # Shared volume for code files
├── script.py
├── Main.java
├── main.c
└── main.cpp
```

## Security Features (To Be Added)

- [ ] Execution timeout enforcement
- [ ] Memory/CPU limits (already in docker-compose)
- [ ] Disable dangerous syscalls (seccomp)
- [ ] Read-only root filesystem
- [ ] No network access
- [ ] User privilege restrictions
- [ ] Input validation and sanitization
- [ ] Output size limits
- [ ] Temporary file cleanup

## Troubleshooting

### Container won't start
```bash
docker-compose logs <service-name>
```

### Permission denied
```bash
# Ensure /tmp/submissions has write permissions
sudo chmod 777 /tmp/submissions
```

### Compile errors
- Check code syntax
- Verify file extensions match language

### Timeout issues
- Increase timeout value
- Optimize code for performance

## Environment Info

- Python: 3.11
- Java: 17 (Eclipse Temurin)
- C/C++: GCC 11
- Docker Network: bridge (code-executor)
