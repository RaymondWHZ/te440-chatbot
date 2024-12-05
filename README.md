# Chicago Crash Dataset Chatbot

This is a chatbot for accessing [Chicago Crash Dataset](https://data.cityofchicago.org/Transportation/Traffic-Crashes-Crashes/85ca-t3if/about_data)

## Getting Started

First, install dependencies using [bun package manager](https://bun.sh):

```bash
bun install
```

Then, copy over the dataset named as `chicago_crash_data_cleaned.csv` in project root directory.

You will also need a `.env` file that sets environment variable `OPENAI_API_KEY` to your OpenAI API Key.

After that, run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
