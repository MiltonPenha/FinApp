/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
    plugins: ["prettier-plugin-tailwindcss"],
    bracketSameLine: true,
    singleAttributePerLine: false,
    printWidth: 120,
};

export default config;