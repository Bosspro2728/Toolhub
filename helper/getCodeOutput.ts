export default async function getCodeOutput (code:string, input:string, lang:string) {
    const response = await fetch('/api/code-output', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            code,
            input,
            lang,
        }),
    });
    const data = await response.json();
    if (response.ok) {
        return data.output;
    } else {
        console.error('Error:', data.error);
    }

}