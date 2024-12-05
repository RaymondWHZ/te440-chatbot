"use client"

import { useChat } from 'ai/react'
import { useEffect, useState } from 'react'
import Markdown from 'react-markdown'

const initialPrompt = `
This is a chatbot for querying chicago car crash dataset.

You may answer directly to the user's question if it relates to basic knowledge about the dataset shown below:

1. Records start from 2017, in total of 809817 entries, with 48 columns (including the time, street name, road condition, injury & lost, geolocation, etc.).
2. Most crashes involve 2 units, and most crashes have 0 injuries. Most crashes happen at road with speed limit of 30 and 2 lanes.
3. This shows that most crashes happen at intersections, and most crashes have over $1500 damage to the car. First crash type varies a lot, but most crashes are rear end and parked motor vehicles.

If you are asked any question that needs to further reference the dataset, directly output some python code and do not include any other text in the message.

You may access the dataset csv named "chicago_crash_data_cleaned.csv" in the current directory.

IMPORTANT: Use the following code to print all rows of a pandas dataframe (referenced as df): print(df.to_markdown()).

For other data structures, you may use print().

You may choose from columns:

CRASH_DATE, POSTED_SPEED_LIMIT, TRAFFIC_CONTROL_DEVICE, DEVICE_CONDITION, WEATHER_CONDITION,
LIGHTING_CONDITION, FIRST_CRASH_TYPE, TRAFFICWAY_TYPE, LANE_CNT, ROADWAY_SURFACE_COND,
ROAD_DEFECT, DAMAGE, MOST_SEVERE_INJURY, INJURIES_TOTAL, INJURIES_FATAL,
NUM_UNITS, PRIM_CONTRIBUTORY_CAUSE, SEC_CONTRIBUTORY_CAUSE

You may get crash year as int array via: crash_years = chicago_crash_data_cleaned["CRASH_DATE"].map(lambda x: int(x[6:10]))

You may not use any other columns. If user's request involves columns not in the list, you should refuse to answer.

You may only use numpy, pandas, and sklearn. Do not accept graphing requests.

Note that when using machine learning and clustering, you should try to limit number of entires by using only data from 2023 and limit total number too 20000. Don't use more than 5 columns for clustering.

Also note that output of python code will be limited to 3000 characters. Don't write code that might exceed this limit.

For each new response, you need to write the whole code block again.

Use common sense to interpret the output of the code block. Explain using a understandable way to the user, in consistent sentences. Specifically, reword value enums to human readable form.
`

const getCodeFromMessage = (message: string) => /```python([\s\S]+)```/.exec(message)?.[1]

export default function Home() {
  const { messages, isLoading, handleSubmit, handleInputChange, input, append } = useChat({
    initialMessages: [
      {
        id: '1',
        role: 'system',
        content: initialPrompt
      }
    ]
  })

  const [codeRunning, setCodeRunning] = useState(false)
  
  useEffect(() => {
    if (isLoading) return
    const code = getCodeFromMessage(messages[messages.length - 1].content)
    if (!code) return
    setCodeRunning(true)
    fetch('/api/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: code
      })
    }).then(res => res.json()).then(data => {
      setCodeRunning(false)
      append({
        role: "system",
        content: "Output from python code: " + data.output.slice(0, 3000)
      })
    })
  }, [isLoading])

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col p-8 pb-20 gap-16 max-w-[600px] w-full min-h-screen font-[family-name:var(--font-geist-sans)]">
        <div>
          This is a chatbot for querying chicago car crash dataset.
        </div>
        {messages.slice(1).map((message) => 
          <div key={message.id}>
            <b>
              {message.role === 'user' ? 'User: ' : message.role === 'assistant' ? 'AI: ' : 'System: '}
            </b>
            <Markdown>
              {message.content}
            </Markdown>
          </div>
        )}

        {codeRunning && <div><b>System: </b><br/>Running code...</div>}

        <form onSubmit={handleSubmit}>
          <input
            className='border border-gray-300 rounded p-2 w-full'
            name="prompt"
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
            placeholder='Type your message here...'
          />
          <button disabled={isLoading || codeRunning || !input} className="mt-2 rounded bg-black text-white w-full p-2 disabled:cursor-not-allowed disabled:bg-gray-500" type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

