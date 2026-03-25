import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SUBMISSIONS_DIR = '/tmp/submissions';

// Ensure submissions directory exists
if (!fs.existsSync(SUBMISSIONS_DIR)) {
  fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });
}

const executeCode = async (req, res) => {
  try {
    const { code, language, input = '', timeout = 3 } = req.body;

    // Validation
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    if (!language) {
      return res.status(400).json({ error: 'Language is required' });
    }

    const supportedLanguages = ['python', 'java', 'c', 'cpp'];
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({
        error: `Unsupported language. Supported: ${supportedLanguages.join(', ')}`
      });
    }

    // Generate unique filename
    const fileId = Date.now() + Math.random().toString(36).substr(2, 9);
    const extensions = { python: 'py', java: 'java', c: 'c', cpp: 'cpp' };
    const ext = extensions[language];
    // Java requires the class name to match filename for public classes
    const filename = language === 'java' ? `Main.java` : `${language}_${fileId}.${ext}`;
    const filepath = path.join(SUBMISSIONS_DIR, filename);

    // Write code to file
    fs.writeFileSync(filepath, code);

    const startTime = Date.now();
    let command = '';
    let output = '';
    let error = '';
    let success = true;

    try {
      // Build and execute command based on language
      if (language === 'python') {
        command = `docker exec -i python-runner python /code/${filename}`;
        if (input) {
          output = execSync(command, {
            input: input,
            timeout: timeout * 1000,
            encoding: 'utf-8'
          });
        } else {
          output = execSync(command, {
            timeout: timeout * 1000,
            encoding: 'utf-8'
          });
        }
      } else if (language === 'java') {
        const className = 'Main';
        command = `docker exec java-runner bash -c "cd /code && javac ${filename} && java ${className}"`;
        output = execSync(command, {
          timeout: timeout * 1000,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe']
        });
      } else if (language === 'c') {
        const outfile = filename.replace('.c', '');
        command = `docker exec c-runner bash -c "cd /code && gcc ${filename} -o ${outfile} && ./${outfile}"`;
        output = execSync(command, {
          timeout: timeout * 1000,
          encoding: 'utf-8'
        });
      } else if (language === 'cpp') {
        const outfile = filename.replace('.cpp', '');
        command = `docker exec cpp-runner bash -c "cd /code && g++ ${filename} -o ${outfile} && ./${outfile}"`;
        output = execSync(command, {
          timeout: timeout * 1000,
          encoding: 'utf-8'
        });
      }
    } catch (err) {
      success = false;

      // Check if it's a timeout error
      if (err.killed) {
        error = `Execution timeout exceeded (${timeout}s)`;
      } else if (err.stderr) {
        error = err.stderr.toString();
      } else if (err.stdout) {
        // Some compilation errors appear in stdout
        error = err.stdout.toString();
      } else {
        error = err.message;
      }

      output = err.stdout ? err.stdout.toString() : '';
    } finally {
      // Cleanup: delete source files
      try {
        fs.unlinkSync(filepath);
      } catch (e) {
        console.error(`Failed to delete ${filepath}:`, e.message);
      }

      // Cleanup: delete compiled files
      if (language === 'java') {
        const classFile = filepath.replace('.java', '.class');
        try {
          fs.unlinkSync(classFile);
        } catch (e) {
          // File might not exist
        }
      } else if (language === 'c' || language === 'cpp') {
        const outfile = filepath.replace(`.${ext}`, '');
        try {
          fs.unlinkSync(outfile);
        } catch (e) {
          // File might not exist
        }
      }
    }

    const executionTime = (Date.now() - startTime) / 1000;

    res.status(200).json({
      output: output,
      error: error || null,
      executionTime: parseFloat(executionTime.toFixed(3)),
      success: success,
      language: language,
      statusCode: 200
    });

  } catch (err) {
    res.status(500).json({
      error: 'Execution failed',
      details: err.message,
      statusCode: 500
    });
  }
};

const executeCodeSystem = async (req, res) => {
  try {
    const { code, language, input = '', timeout = 3 } = req.body;

    // Validation
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    if (!language) {
      return res.status(400).json({ error: 'Language is required' });
    }

    const supportedLanguages = ['python', 'java', 'c', 'cpp'];
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({
        error: `Unsupported language. Supported: ${supportedLanguages.join(', ')}`
      });
    }

    // Create temporary directory
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'code-exec-'));
    const startTime = Date.now();
    let output = '';
    let error = '';
    let success = true;

    try {
      if (language === 'python') {
        const scriptPath = path.join(tmpDir, 'script.py');
        fs.writeFileSync(scriptPath, code);

        const result = spawnSync('python3', [scriptPath], {
          input: input,
          encoding: 'utf-8',
          timeout: timeout * 1000,
          maxBuffer: 10 * 1024 * 1024
        });

        output = result.stdout || '';
        error = result.stderr || '';
        success = result.status === 0 || result.status === null;

      } else if (language === 'java') {
        const className = 'Main';
        const javaFile = path.join(tmpDir, `${className}.java`);
        fs.writeFileSync(javaFile, code);

        // Compile
        const compileResult = spawnSync('javac', [javaFile], {
          encoding: 'utf-8',
          timeout: timeout * 1000
        });

        if (compileResult.status !== 0) {
          error = compileResult.stderr || compileResult.stdout || 'Compilation failed';
          success = false;
        } else {
          // Execute
          const execResult = spawnSync('java', ['-cp', tmpDir, className], {
            input: input,
            encoding: 'utf-8',
            timeout: timeout * 1000,
            maxBuffer: 10 * 1024 * 1024
          });

          output = execResult.stdout || '';
          error = execResult.stderr || '';
          success = execResult.status === 0 || execResult.status === null;
        }

      } else if (language === 'c') {
        const cFile = path.join(tmpDir, 'code.c');
        const exeFile = path.join(tmpDir, 'code');
        fs.writeFileSync(cFile, code);

        // Compile
        const compileResult = spawnSync('gcc', ['-o', exeFile, cFile], {
          encoding: 'utf-8',
          timeout: timeout * 1000
        });

        if (compileResult.status !== 0) {
          error = compileResult.stderr || compileResult.stdout || 'Compilation failed';
          success = false;
        } else {
          // Execute
          const execResult = spawnSync(exeFile, [], {
            input: input,
            encoding: 'utf-8',
            timeout: timeout * 1000,
            maxBuffer: 10 * 1024 * 1024
          });

          output = execResult.stdout || '';
          error = execResult.stderr || '';
          success = execResult.status === 0 || execResult.status === null;
        }

      } else if (language === 'cpp') {
        const cppFile = path.join(tmpDir, 'code.cpp');
        const exeFile = path.join(tmpDir, 'code');
        fs.writeFileSync(cppFile, code);

        // Compile
        const compileResult = spawnSync('g++', ['-o', exeFile, cppFile], {
          encoding: 'utf-8',
          timeout: timeout * 1000
        });

        if (compileResult.status !== 0) {
          error = compileResult.stderr || compileResult.stdout || 'Compilation failed';
          success = false;
        } else {
          // Execute
          const execResult = spawnSync(exeFile, [], {
            input: input,
            encoding: 'utf-8',
            timeout: timeout * 1000,
            maxBuffer: 10 * 1024 * 1024
          });

          output = execResult.stdout || '';
          error = execResult.stderr || '';
          success = execResult.status === 0 || execResult.status === null;
        }
      }

    } catch (err) {
      success = false;
      if (err.killed) {
        error = `Execution timeout exceeded (${timeout}s)`;
      } else {
        error = err.message;
      }
    } finally {
      // Cleanup temp files
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch (e) {
        console.error(`Failed to cleanup ${tmpDir}:`, e.message);
      }
    }

    const executionTime = (Date.now() - startTime) / 1000;

    res.status(200).json({
      output: output,
      error: error || null,
      executionTime: parseFloat(executionTime.toFixed(3)),
      success: success,
      language: language,
      statusCode: 200,
      method: 'system'
    });

  } catch (err) {
    res.status(500).json({
      error: 'Execution failed',
      details: err.message,
      statusCode: 500
    });
  }
};

export { executeCode, executeCodeSystem };
