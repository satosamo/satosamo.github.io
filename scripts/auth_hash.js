        const CORRECT_HASH = "b2581e1bdbe7c3fdcbe6814978fcce82fc76a8ed3ccc2ab69717f91be294df98";
        const XOR_CONSTANT_B64 = "HgECVgICU2kIWVYAHUteWQcEHUpfRwlc";
        document.getElementById("submitButton").addEventListener("click", checkPassword);
        document.getElementById("passwordInput").addEventListener("keyup", (event) => {
            if (event.key === "Enter") {
                checkPassword();
            }
        });

        async function checkPassword() {
            const input = document.getElementById("passwordInput").value;
            const messageEl = document.getElementById("message");
            
            const inputHash = await hashString(input);
        
            if (inputHash === CORRECT_HASH) {
                messageEl.textContent = "";
        
                const XOR_CONSTANT = atob(XOR_CONSTANT_B64); 
        
                const salt = await hashString(input + input);
                const saltedInput = input + salt;
                const secondHash = await hashString(saltedInput);
        
                const key = secondHash.substring(0, XOR_CONSTANT.length);
                const path = xorStrings(key, XOR_CONSTANT);
        
                console.log("Access granted. Redirecting to:", path);
                window.location.href = path;
        
            } else {
                messageEl.textContent = "Access Denied";
            }
        }

        async function hashString(str) {
            const encoder = new TextEncoder();
            const data = encoder.encode(str);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hexHash;
        }

        function xorStrings(s1, s2) {
            let result = '';
            const length = Math.min(s1.length, s2.length);

            for (let i = 0; i < length; i++) {
                result += String.fromCharCode(s1.charCodeAt(i) ^ s2.charCodeAt(i));
            }
            return result;
        }