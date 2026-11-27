# TradeFlow

**Making Financial Markets Accessible Through Voice AI**

Document: Product Requirements Document (PRD) Version: 1.5 Product: TradeFlow Platform: Web application / Progressive Web App Primary Market: India Theme: Everyday Access for All



---



## 1. Product Overview

### 1.1 What is TradeFlow?

TradeFlow is a voice-first financial access platform that allows users to understand market information, research companies, manage portfolios and initiate trading activities through natural conversations.

Instead of forcing users to navigate multiple screens, understand complicated financial terminology or type precise trading instructions, TradeFlow allows them to communicate naturally.

A user should be able to say:

"Infosys ke 10 shares kharidne hain." "Why is Reliance falling today?" "How is my portfolio performing?" "Explain P/E ratio in simple language." "If TCS goes below ₹3,500, notify me."

TradeFlow understands the request, retrieves relevant information, explains the result and guides the user through the appropriate action.

The platform combines voice interaction with a familiar visual trading dashboard. Users can always see, review and control what the AI is doing.

### 1.2 Problem Statement

Financial platforms are often difficult to use for people who are new to investing or unfamiliar with financial terminology.

Users frequently need to switch between different screens and services to:

- Check market prices and stock movements.
- Research companies and read financial news.
- Understand financial ratios and investment terminology.
- Monitor their portfolio.
- Place and manage orders.
- Track specific market conditions.

These difficulties become greater for users who are more comfortable speaking in regional languages than typing in English.

TradeFlow addresses this by introducing a conversational interface that makes financial information easier to access and financial activities easier to understand.

### 1.3 Product Goals

- Allow users to complete common financial tasks through natural voice commands.
- Support Indian languages and mixed-language conversations.
- Make complex financial terminology understandable through simple explanations.
- Provide reliable, source-backed market information.
- Keep users in control of every financial action.
- Provide a simple experience for beginners without removing useful information for experienced traders.

### 1.4 Non-Goals for the Hackathon MVP

The hackathon prototype is not expected to be a fully operational stock brokerage.

The following are outside the initial MVP:

- Direct execution of real stock-market orders.
- Integration with every Indian stockbroker.
- Production-grade automated algorithmic trading.
- Investment advisory or guaranteed stock predictions.
- Full-scale broker onboarding and regulatory infrastructure.

The MVP will demonstrate order workflows using a simulated trading environment. Actual order execution will require broker API integration, appropriate authorisation and compliance work.



---



## 2. Target Users

### 2.1 First-Time Investors

Age group: 18–25

Students and young professionals who want to start investing but may not understand financial terms, stock charts or trading interfaces.

Their needs:

- Simple explanations.
- Beginner-friendly stock research.
- Regional-language interaction.
- Guidance before taking financial actions.

### 2.2 Retail Investors

Age group: 25–45

People who regularly invest and want to monitor their holdings, understand market movements and research companies.

Their needs:

- Portfolio summaries.
- Company research.
- Market news.
- Faster access to information.

### 2.3 Active Traders

Age group: 22–45

Users who frequently monitor prices and need quick access to market information and order-management features.

Their needs:

- Watchlist monitoring.
- Price alerts.
- Conditional order creation.
- Quick order preparation and approval.

### 2.4 Sub-brokers and Financial Intermediaries

Age group: 25–55

Intermediaries who handle multiple clients and regularly receive requests about market information and trading activities.

Their needs:

- A dedicated broker workspace.
- Client request management.
- Trade approval workflow.
- Order history and activity tracking.



---



## 3. Core Product Experience

TradeFlow will have a conventional trading dashboard supported by a voice-first assistant.

The voice assistant will be available throughout the application through a floating microphone button.

Users should not need to navigate to a separate voice-only page to interact with the assistant.

Every action that needs confirmation is completed with one click. Voice is always optional.

### 3.1 Main Navigation

The application will contain the following modules:

| **Module**     | **Purpose**                          |
| -------------- | ------------------------------------ |
| Dashboard      | Market overview and account summary  |
| Talk           | Conversational AI assistant          |
| Portfolio      | Holdings, balance and performance    |
| Watchlist      | Track selected stocks                |
| Rules          | Manage conditional alerts and orders |
| Approvals      | Review pending financial actions     |
| Broker Console | Manage client requests and approvals |
| Settings       | Language, security and preferences   |

The floating microphone should remain accessible on the main application screens, except where recording would interfere with another interaction.

### 3.2 Conversational Results and Website Navigation

TradeFlow must use intent-aware navigation. A voice or typed request must not automatically send the user to a different page. The frontend should render the result in the current context unless the request explicitly requires a dedicated workspace or the user asks to open a detailed view.

**Navigation behaviour**

- General questions and explanations (for example, "Explain P/E ratio") return an answer card or contextual popup on the current page.
- Stock research questions (for example, "Why is Reliance falling today?") return a concise answer with sources and a compact stock/research card. The user remains on the current page unless they select "Open stock details" or the request explicitly asks to view the stock page.
- Trade commands (for example, "Buy 10 Infosys shares") open an order-preview card or modal in the current page. They must not automatically navigate to the stock page, order page or order submission flow.
- A trade command must also provide a clearly visible, separate action such as **"View Infosys stock"** or **"Open stock details"**. Selecting this action navigates to the Infosys stock-detail page; it is never triggered automatically.
- The stock-detail page must show the selected instrument's current/most recent available market status, price, price change, interactive price chart and relevant stock information (such as key metrics, company information and available news/research). Show the market-data timestamp and clearly label delayed, stale, unavailable or demo data. Do not present unavailable data as live.
- The order preview remains available in the current context while the user chooses whether to open the stock-detail page. Preserve the pending order and conversation context across this navigation so the user can return and review it.
- Approval remains a separate explicit action on the order preview. Viewing the stock page does not approve, submit, modify or cancel the order. After approval, show the authoritative order status and provide a link to order details/history.
- Portfolio, watchlist, rules and approvals requests may navigate to their corresponding modules when the intent is to open or manage that workspace (for example, "Open my portfolio"). A simple question about those subjects should first return a contextual answer card; provide an explicit action to open the full module.
- Ambiguous requests must trigger a clarification in the current context rather than speculative navigation.
- The assistant response schema must include a validated `ui_action` / `route_target` field and a separate list of explicit user-selectable `suggested_actions` (for example `VIEW_STOCK`, `OPEN_PORTFOLIO`, `OPEN_WATCHLIST`, `OPEN_RULES`, `OPEN_APPROVALS`, `OPEN_ORDER_DETAILS`). For a trade command, the default navigation action is `STAY`; `VIEW_STOCK` is rendered as a button/link such as "View Infosys stock". Only a user click may invoke the corresponding allowlisted route. The frontend maps only allowlisted values to client-side routes; the LLM must never provide arbitrary URLs or execute navigation code.
- Use client-side routing in the React application so approved navigation does not reload the entire website. Preserve the current conversation and relevant context when moving between modules. Browser Back should return to the previous view.
- The user can always navigate manually through the main navigation. The floating assistant remains available across supported pages.

**Acceptance criteria**

- A normal query does not unexpectedly change the current route.
- A trade request displays a reviewable order preview in the current context and never navigates straight to execution or automatically opens the stock-detail page.
- A trade request for Infosys displays a separate "View Infosys stock" action; the Infosys stock-detail page opens only after the user selects it.
- The stock-detail page displays the selected instrument's chart and current/most recent available market information with freshness/demo labels.
- Navigating to a stock-detail page and returning preserves the pending order preview and conversation context; viewing the page does not approve or alter the order.
- Explicit navigation requests and user-selected navigation actions open only the correct allowlisted module.
- The frontend preserves conversation context and supports browser Back.



---



## 4. Functional Requirements

### FR-01: Dashboard

**Purpose**

Provide users with a familiar overview of the market, their portfolio and recent activity.

**UI Requirements**

The dashboard should contain:

A. Market Overview

- NIFTY 50.
- SENSEX.
- Current index value.
- Absolute and percentage change.
- Market status where supported by the data provider.

B. Watchlist

- Stock name and ticker.
- Latest available price.
- Daily price change.
- Percentage change.
- Add/remove stock functionality.

C. Portfolio Summary

- Total portfolio value.
- Invested amount.
- Current profit or loss.
- Available demo balance in the hackathon prototype.

D. Stock Chart

- Interactive price chart.
- Time filters such as 1D, 1W, 1M, 6M and 1Y.
- Stock selection.

E. Recent Activity

- Recent simulated orders.
- Completed actions.
- Pending approvals.
- Conditional alerts.

F. Floating Voice Assistant

- Microphone button.
- Recording indicator.
- Live transcript.
- Assistant response.
- Voice playback.

**Frontend Behaviour**

- Load the dashboard when the user opens the application.
- Retrieve available market data and portfolio information.
- Display loading states while data is being retrieved.
- If a market data provider fails, display an unavailable state rather than fabricated prices.
- Allow the user to open individual stocks from the watchlist.
- Keep the voice assistant accessible across the main pages.

**Backend Behaviour**

The backend should provide separate endpoints for:

- Market indices.
- Watchlist data.
- Portfolio summary.
- Recent activity.
- Stock chart history.

The backend must distinguish between live data, delayed data, cached data and sample/demo data.

**Acceptance Criteria**

- Dashboard loads without external API keys.
- Missing data is displayed honestly.
- Users can navigate between modules.
- Floating microphone is accessible.
- Sample data, if used, is clearly labelled as demo data.



---



### FR-02: Voice Assistant

**Purpose**

Allow users to interact with TradeFlow using natural speech rather than relying entirely on manual navigation.

This is the central interaction feature of the product.

**Example Commands**

| **User says**                      | **Expected action**           |
| ---------------------------------- | ----------------------------- |
| "Buy 10 shares of Infosys"         | Prepare an order              |
| "Reliance kyun gir raha hai?"      | Research market movement      |
| "Show my portfolio"                | Retrieve portfolio summary    |
| "Explain P/E ratio"                | Explain financial terminology |
| "Alert me if TCS falls below 3500" | Prepare a price alert         |

**Voice Interaction Flow**

*Step 1: Start Recording*

The user clicks the floating microphone button.

The frontend:

- Requests microphone permission.
- Starts the recording session.
- Displays a recording animation.
- Shows a live transcription when available.

*Step 2: Speech Recognition*

Wispr Flow is the preferred speech-to-text provider.

The frontend should:

- Request a short-lived authentication token from the backend.
- Establish a secure WebSocket connection.
- Stream mono audio in the format required by Wispr Flow.
- Send language hints, the stock ticker dictionary and the user's personal dictionary where supported.
- Receive transcription updates.
- Display the transcript to the user.

The backend must never expose a permanent Wispr API key in frontend code.

*Step 3: Silence Detection*

If the user stops speaking for five seconds, recording should automatically stop.

The frontend should also provide a manual stop button.

*Step 4: Intent Detection*

The recognised text is passed to the AI agent.

The agent determines whether the request is:

- Stock research.
- Portfolio query.
- Buy order.
- Sell order.
- Conditional alert.
- Financial education.
- General financial query.
- Unsupported request.

The agent should return structured data rather than directly executing an action.

*Step 5: Response*

The assistant responds with:

- A short text answer.
- A relevant visual component when necessary.
- Voice playback where enabled.
- Action buttons where user confirmation is required.

**Voice Fallback**

If Wispr Flow is unavailable:

- Check whether browser speech recognition is supported.
- If supported, offer browser-based speech recognition.
- Always provide typed input as a fallback.
- Display a clear message explaining which voice service is unavailable.

The application must remain usable without a Wispr API key.

**Hands-Free Mode**

Hands-free mode lets users run a full conversation without touching the screen.

- Wispr Flow handles speech input.
- Sarvam TTS is the preferred provider for spoken responses, especially for Indian languages.
- Windows speech synthesis is the secondary option where Sarvam is unavailable or not configured.
- Browser SpeechSynthesis remains the final fallback.
- If no speech-output provider is available, the assistant shows the text response with single-click action buttons on the UI.

Hands-free mode must never be the only way to complete an action.

**Acceptance Criteria**

- User can initiate and stop voice input.
- Transcript is visible.
- Supported languages are passed as recognition hints.
- Unclear speech does not trigger a financial action.
- Typed input works when voice services are unavailable.
- Voice commands are processed through the same agent regardless of input method.
- Hands-free mode can be switched on and off.
- Spoken responses fall back through Sarvam, Windows and browser speech in order.
- Every spoken action also has a visible single-click equivalent.

**API availability logic**

- Check whether the Wispr Flow API key exists.
- If configured, enable Wispr Flow transcription.
- If unavailable, show a typed input option.
- If browser speech recognition is supported, optionally provide it as another fallback.
- Never prevent users from accessing the rest of the application because voice recognition is unavailable.



---



### FR-03: Multilingual Support

**Purpose**

Allow users to communicate in languages they are comfortable speaking.

**Supported Languages**

- English.
- Hindi.
- Kannada.
- Marathi.
- Gujarati.
- Tamil.

Mixed-language conversations such as Hinglish should also be supported where the speech provider allows it.

**Behaviour**

- Store the user's preferred language in settings.
- Pass the selected language as a speech-recognition hint.
- Detect language changes where possible.
- Preserve company names, stock symbols and financial numbers.
- Generate the response in the user's preferred language.
- Provide an option to switch to English.
- Preserve the original-language transcript alongside any normalized representation used internally.

**Machine Translation and Structured Extraction Pipeline**

Machine translation to English is part of the MVP processing pipeline for supported non-English and mixed-language input. It is an internal normalization step to make downstream intent and entity extraction more consistent; it must not force the user to speak or receive responses in English.

1. **Transcribe:** Speech-to-text returns the original transcript and, where available, a language/confidence estimate. Typed input enters the same pipeline.
2. **Detect language:** Identify the language or code-switching pattern. Use the user's preferred language and speech-provider hints as supporting context, not as proof that every utterance is in that language.
3. **Route by language pattern:** Determine whether the utterance is English, a single non-English language, or code-switched/mixed-language input. Use language identification at sentence/segment level where possible; a sentence containing English finance terms inside another language should be treated as mixed when the language pattern indicates code-switching.
4. **Translate/normalize to English:**
   - **English-only input:** Skip translation and pass the original text to extraction.
   - **Single-language, non-English input:** Use a smaller, dedicated machine-translation model to produce an English working representation.
   - **Mixed-language/code-switched input:** Use an LLM-based translation/normalization path because code-switching, transliteration, colloquial phrasing and embedded English financial terms may be poorly handled by a smaller translation model.
   - Keep the original transcript unchanged. Record the detected language pattern, normalization path/model and normalized text as permitted by the privacy and retention policy.
5. **Use translation for keyword mapping:** The English normalized representation helps map action words, financial terms and number words from different supported languages to canonical English concepts before intent/entity extraction. For example, Hindi "kharido", Kannada equivalents for buying, and other supported-language purchase expressions should resolve to the canonical action `BUY`; selling expressions should resolve to `SELL`. Maintain a versioned financial keyword/glossary map and user-specific aliases. Translation provides semantic normalization; the glossary and voice profile provide deterministic mappings for known terms.
6. **Protect financial entities:** Apply the financial glossary and user's voice profile before and during normalization. Stock names, company aliases, ticker symbols, exchange names, quantities, currency values, dates, order types and negation must be preserved or mapped to canonical values. Translation must not translate or alter ticker symbols, change numeric values, remove negation or turn a company name into an ordinary dictionary meaning.
7. **Extract structured fields:** The AI agent extracts intent and typed entities from the normalized text into a schema, such as `intent`, `symbol`, `side`, `quantity`, `order_type`, `price`, `condition`, `target_price`, `time_period` and `response_language`. Fields not relevant to the intent are omitted.
8. **Cross-check and validate:** Validate extracted values against the original transcript, normalized representation, user dictionary, instrument master and deterministic backend rules. If the original and normalized text disagree, translation confidence is low, or a critical field is uncertain, ask the user to clarify instead of guessing.
9. **Respond in the selected language:** Generate the answer and spoken playback in the user's selected/preferred language. The internal English representation must not dictate the response language.

Machine translation or LLM-based normalization is not itself the authority for a financial action. The backend validates canonical structured fields and the user must review the complete order preview before approval. Preserve numeric values and negation exactly; never infer missing order parameters. If translation/normalization and the original utterance conflict on a trade-critical field, stop and ask the user to clarify.

**Important Number Handling**

Financial commands must correctly interpret:

- Ten shares.
- 10 shares.
- Das shares.
- ₹2,500.
- 2.5 thousand.
- 1 lakh.
- 1.5 crore.

Numbers should be parsed into a structured representation before any order is prepared.

**Voice Profile and Keyword Mapping**

Each user has a voice profile that makes it easier to extract details from spoken sentences.

- Personal dictionary: stock names, nicknames and abbreviations the user commonly says (for example "Reliance" or "RIL" mapped to RELIANCE).
- Frequently traded shares: the user's most traded and watched symbols are prioritised when resolving ambiguous stock names.
- Keyword mapping: action words, financial terms and numbers in supported languages are mapped to their English equivalents before intent detection (for example "kharidna", "kharido" and "khareedu" map to BUY; "bechna" maps to SELL; "das" maps to 10).
- The profile feeds the speech provider's dictionary and language hints where supported.
- Users can add, edit and delete aliases, preferred pronunciations, abbreviations and mappings for company names, tickers and financial terms.
- Frequently traded and watched companies are personalised ranking hints, not proof of the intended symbol; ambiguity still requires clarification.
- The system may suggest adding a correction to the personal dictionary, but must not silently learn a permanent mapping from a single uncertain recognition.
- Voice profiles are language/user preferences and vocabulary data; they are not voiceprints and must never be used to authenticate a user.
- Low-confidence matches still trigger clarification and are never guessed.

**Acceptance Criteria**

- Supported languages can be selected.
- Mixed-language input is handled where supported.
- Numeric values are parsed and read back before approval.
- Low-confidence stock-name recognition triggers clarification.
- Local-language action words are mapped to the correct English intent.
- Frequently traded shares are prioritised when a stock name is ambiguous.
- Users can view and edit their personal dictionary.



---



### FR-04: Stock Research and Market Intelligence

**Purpose**

Help users understand company performance and market movements without manually searching across multiple platforms.

**Example Queries**

- "Why is Reliance falling today?"
- "What happened to Infosys this week?"
- "Give me a quick analysis of TCS."
- "What are the latest announcements from HDFC Bank?"

**User Flow**

1. User asks a research question.
2. AI agent identifies the company and requested time period.
3. Backend retrieves relevant market data and news.
4. Backend validates the source information and timestamps.
5. AI summarises the retrieved evidence.
6. Frontend displays the answer with source references.

**Data Sources**

Preferred sources include:

- NSE and BSE corporate announcements.
- Reuters.
- Moneycontrol.
- Economic Times.
- Mint.

The implementation must use accessible and permitted APIs or feeds. Listing a publication as a preferred source does not mean its content is automatically available through an API.

**Predefined Knowledge-Based Queries**

The platform includes a set of predefined research queries backed by the local knowledge base, for example:

- Company overview.
- Key financial ratios explained.
- Recent announcements.
- Sector summary.
- Weekly price movement summary.

Users can pick these from the UI or ask them by voice.

- Predefined queries work in Demo Mode without external API keys.
- Open-ended research queries require the news and AI services. If those keys are not configured, the app shows "API not set" and offers the predefined queries instead.

**AI Behaviour**

The AI should:

- Use retrieved evidence rather than relying on memory for current events.
- Identify possible reasons for a price movement.
- Separate confirmed announcements from media interpretation.
- Include source links and timestamps.
- State when there is insufficient evidence.
- Avoid making unsupported predictions.

**Response Format**

The default response should be concise:

- Main observation.
- Two or three evidence-backed contributing factors, if available.
- Source references.
- Data timestamp.

The answer should normally remain under 40 words, with an option to request more detail.

**Example**

User: "Why is Reliance falling today?"

Assistant: "Reliance is down today. Recent company announcements and market reports indicate possible contributing factors. Here are the relevant developments and their sources."

The actual response must only include reasons supported by retrieved information.

**Acceptance Criteria**

- Research responses include source references.
- Old information is not presented as current.
- Missing sources result in an explicit limitation message.
- AI cannot invent news or announcements.
- Users can open the original source.
- Predefined research queries work without external API keys.
- Open-ended research shows "API not set" when the required key is missing.



---



### FR-05: Voice-Based Order Preparation

**Purpose**

Allow users to prepare buy and sell orders through natural speech.

**Example**

User: "Infosys ke 10 shares kharido."

**Workflow**

*Step 1: Understand the Command*

The agent extracts:

- Stock: Infosys.
- Symbol: INFY.
- Action: BUY.
- Quantity: 10.
- Order type: Default supported order type, or ask the user if required.
- Price: Market or specified limit price.

If a required field is missing, the assistant asks one short question.

The agent uses the user's voice profile (personal dictionary and frequently traded shares) to resolve stock names.

*Step 2: Validate the Request*

The backend checks:

- Whether the stock symbol exists.
- Whether the quantity is valid.
- Whether the market is open, where applicable.
- Whether the user's simulated balance is sufficient.
- Whether the requested order type is supported.
- Whether configured transaction limits are exceeded.

*Step 3: Generate Order Preview*

Display an order confirmation card.

It must contain:

- Stock name and ticker.
- Buy or sell.
- Quantity.
- Order type.
- Indicative price.
- Estimated total.
- Applicable charges, if calculated.
- Order expiry.
- Approve and Decline actions.

*Step 4: User Approval*

The user must explicitly approve the order.

Approval can be completed with a single click on the confirmation card or, when Hands-Free Mode is enabled, through an explicit voice confirmation within an authenticated, active user session.

Hands-Free Mode is available only after the user has authenticated. Voice confirmation is accepted only when the backend verifies the active session, matches the confirmation to the exact pending order and its displayed payload, and confirms that the approval has not expired. Voice recognition is an input method only; it is never an authentication factor.

*Step 5: Order Processing*

For the hackathon MVP:

- Submit the approved request to the simulated order service.
- Update the demo order ledger.
- Update the demo portfolio and balance.
- Create an audit event.
- Display the order result.

For a production deployment, this service must be replaced or extended with an authorised broker integration.

**Safety Requirements**

- The AI must never directly execute an order.
- Every order requires explicit approval through either the confirmation card or authenticated-session voice confirmation when Hands-Free Mode is enabled.
- Hands-Free Mode must not accept order approvals when the user is unauthenticated, the session has expired, or the session has been invalidated or locked.
- Voice recognition must never be used to establish or restore the user's identity.
- A user can cancel a pending request before submission.
- An approval expires after five minutes.
- The user must be able to inspect the order details before approval.
- Voice recognition alone must not be treated as identity verification.

**Acceptance Criteria**

- Correct order details are extracted.
- Missing information triggers clarification.
- Invalid requests are rejected.
- Approval is required.
- Duplicate approval attempts cannot create duplicate orders.
- Every order action is logged.



---



### FR-06: Conditional Alerts and Orders

**Purpose**

Allow users to create rules that monitor stock prices and notify them when a specified condition is met.

**Example**

"Notify me if TCS falls below ₹3,500."

Or:

"If Infosys rises above ₹2,000, prepare a buy order for 5 shares."

**Workflow**

*Step 1: Extract the Rule*

The AI extracts:

- Stock symbol.
- Condition type.
- Target price.
- Action, if any.
- Quantity, if applicable.

*Step 2: Confirm the Rule*

Display a summary:

"Notify me when TCS falls below ₹3,500."

The user confirms the rule with a single click (voice confirmation optional).

*Step 3: Store the Rule*

The backend stores the rule in PostgreSQL with:

- User ID.
- Stock symbol.
- Condition.
- Target value.
- Action.
- Quantity.
- Status.
- Created timestamp.

*Step 4: Monitor the Condition*

A background worker checks eligible rules against the latest available market data.

It should:

- Check the data timestamp.
- Avoid repeated notifications.
- Evaluate only active rules.
- Mark triggered rules appropriately.

*Step 5: Trigger Notification*

When the condition is satisfied:

- Notify the user.
- Show the current observed price and timestamp.
- Display the original rule.
- If the rule includes an order, prepare an approval card.

The MVP must not automatically submit a financial order merely because the price condition was triggered.

**Acceptance Criteria**

- Users can create and delete rules.
- Rules can be paused and resumed.
- Triggered rules are recorded.
- Duplicate alerts are prevented.
- Missing or stale price data does not silently trigger a rule.



---



### FR-07: Portfolio Management

**Purpose**

Give users a clear view of their holdings and portfolio performance.

**UI Requirements**

Display:

- Total portfolio value.
- Total invested value.
- Current profit or loss.
- Individual holdings.
- Quantity held.
- Average purchase price.
- Latest available price.
- Percentage return.
- Allocation by stock.

**Voice Queries**

- "How is my portfolio performing?"
- "Which stock has the highest allocation?"
- "How much profit am I making?"
- "Show my top three holdings."

**Backend Behaviour**

The portfolio service should retrieve holdings and calculate values deterministically.

For example:

Current value = Quantity × Latest available price Profit or loss = Current value − Invested value

Portfolio calculations must not be delegated to an LLM.

The AI can explain the calculated result in simple language, but the calculation itself must be performed by application code.

**Acceptance Criteria**

- Portfolio values match the underlying ledger.
- Missing prices are clearly identified.
- Demo holdings are labelled as demo data.
- Voice queries return the same values as the visual dashboard.



---



### FR-08: Contextual Financial Learning — Click-to-Explain Voice Popup

**Purpose**

Help users understand financial terminology without leaving the current page.

This feature is particularly important for beginners and directly supports the Everyday Access for All theme.

**Example Terms**

- P/E Ratio.
- EPS.
- Market Capitalisation.
- Dividend Yield.
- Bull Market.
- Bear Market.
- Mutual Funds.
- Bonds.
- Portfolio Diversification.
- Stop-Loss.

**UI Behaviour**

- Important financial terms should have an identifiable tooltip or clickable indicator.
- When a user clicks a term, open a small popup or side panel.
- Show a simple definition.
- Show a practical example.
- Provide a Listen button.
- Provide replay, pause and close controls.
- The popup must not navigate the user away from the current screen.

**Example**

Term: P/E Ratio

Simple explanation: P/E ratio compares a company's share price with its earnings per share. It helps investors understand how much they are paying for each rupee of earnings.

Example: If a company's share price is ₹200 and its earnings per share are ₹10, its P/E ratio is 20.

**Technical Implementation**

*Frontend*

React component: FinancialTermPopup.

- Accepts term, language and context as properties.
- Opens on click.
- Displays definition and example.
- Handles listen, pause, resume and replay.

*Backend*

Endpoint: POST /api/education/explain.

- Receives term, preferred language and optional context.
- Retrieves a trusted glossary definition or requests an explanation from the LLM.
- Returns structured text containing a definition and example.

*Text-to-Speech*

- Use Sarvam TTS where configured, then Windows speech synthesis, then browser SpeechSynthesis to read the explanation.
- Select a suitable voice for the user's preferred language.
- Provide text even when a voice is unavailable.

Important Wispr Flow clarification: Wispr Flow is used for speech input and transcription. It does not create this popup or provide its spoken explanation. React creates the popup, the AI generates the explanation and the text-to-speech provider reads it aloud.

*Fallback*

- Maintain a local glossary of common financial terms.
- If the LLM is unavailable, the application should use the glossary rather than leaving the feature unusable.

**Acceptance Criteria**

- Clicking a term opens the popup.
- Definition and example are displayed.
- Listen reads the explanation aloud where a suitable voice is available.
- Text remains available if speech output fails.
- Closing the popup returns the user to the same page and position.

**Integrated Mode**

- Uses Anthropic API.
- Performs LLM-based intent detection.
- Uses backend tools to retrieve data.
- Generates conversational responses.

**Demo Mode (when judges will test by themselves)**

- Uses a locally implemented intent handler.
- Supports predefined commands.
- Uses deterministic backend functions.
- Returns predefined or locally generated responses.

For example:

User: "Show my portfolio."

Demo Mode should actually retrieve the user's sample portfolio from the database and calculate its value. It shouldn't simply return a hardcoded message.



---



### FR-09: Broker Console

**Purpose**

Give brokers and sub-brokers a workspace to manage client requests and review financial actions.

**Broker Dashboard**

Display:

- Total connected clients.
- Pending client requests.
- Pending trade approvals.
- Recent activities.
- Client search.
- Request history.

**Client Interaction**

A client can interact with a dedicated broker assistant through the TradeFlow application.

The assistant can:

- Answer permitted market questions.
- Retrieve authorised client portfolio information.
- Prepare order requests.
- Create alerts.
- Forward approval-required requests to the broker.

**Broker Approval Workflow**

1. Client submits a request.
2. Backend verifies the client session and permissions.
3. AI prepares a structured request.
4. Broker receives an approval notification.
5. Broker reviews stock, quantity, action and price.
6. Broker approves or rejects.
7. The client receives the result.

**Security Requirements**

- Clients must be linked to the correct broker account.
- One client must never access another client's portfolio.
- Broker permissions must be enforced by backend code.
- Every approval and rejection must be audited.

**MVP Scope**

Implement a working broker console with demo clients and simulated approval workflows.

Production broker connectivity, regulated client mandates and real trade routing are future integrations.

The detailed client, broker and hands-free approval sequence is specified in Section 19, Hands-Free Voice Trading and Broker-Client Approval Workflow.



---



### FR-10: Notifications and Activity History

**Purpose**

Keep users informed about important account and rule events.

**Notifications**

- Order approved.
- Order rejected.
- Order completed in demo mode.
- Price condition triggered.
- Broker approval requested.
- Broker approval completed.
- Market data unavailable.
- Security-related event.

**Activity History**

Each activity should contain:

- Event type.
- Description.
- Timestamp.
- Related stock or order.
- Status.
- Source or initiating channel.

Users should be able to review previous actions.



---



### FR-11: Settings and Security

**User Settings**

- Preferred language.
- Voice output on/off.
- Hands-free mode on/off.
- Speech speed.
- Preferred input method.
- Notification preferences.
- Security settings.

**Authentication**

The MVP should use a secure login mechanism and session management.

**Security Requirements**

- HTTPS/TLS for communication.
- Passwords hashed using a secure password-hashing algorithm.
- Sensitive credentials stored in environment variables.
- Backend permission checks on every protected endpoint.
- Rate limiting for sensitive actions.
- Single-use approval tokens.
- Audit logs for order and broker actions.
- Secure, HttpOnly, SameSite cookies (if cookie-based sessions are used), CSRF protection, session rotation and revocation.
- MFA or step-up authentication for high-risk actions.
- Object-level and role-level authorization on every resource access.
- Encryption at rest for sensitive database fields and backups, with managed secret storage.
- Redaction of credentials, tokens, personal data and financial details from logs.
- Security controls for queue access, event payloads and worker identities.

**Important Encryption Distinction**

TLS protects information while it travels between the user and the server. Encryption at rest protects stored information.

True end-to-end encryption is different. If the backend AI needs to read a message to process it, the backend must receive the readable content. Therefore, the MVP must not claim full end-to-end encryption unless the architecture genuinely supports it.



---



## 5. Technical Architecture

### 5.1 Technology Stack

| **Layer**             | **Technology**                                                                       |
| --------------------- | ------------------------------------------------------------------------------------ |
| Frontend              | React, TypeScript, Vite                                                              |
| Styling               | Tailwind CSS                                                                         |
| Backend               | Python 3.12, FastAPI                                                                 |
| Database              | PostgreSQL                                                                           |
| Background processing | Celery workers (RabbitMQ broker); asyncio for request-scoped I/O                                                                       |
| AI agent              | Anthropic SDK with tool use                                                          |
| Speech input          | Wispr Flow                                                                           |
| Voice output          | Sarvam TTS (preferred), Windows speech synthesis, Browser SpeechSynthesis (fallback) |
| Charts                | Lightweight charting library                                                         |
| Market data           | yfinance for prototype data                                                          |
| Task queue             | RabbitMQ (durable task queues for Celery)                                      |
| Event streaming       | Apache Kafka (domain-event streaming; phased adoption)                          |
| Deployment            | Docker Compose                                                                       |

### 5.2 Architecture Overview

The application should use a modular architecture.

**Frontend**

- Dashboard.
- Voice interface.
- Portfolio.
- Watchlist.
- Rules.
- Approval cards.
- Broker console.
- Settings.

**Backend API**

- Authentication.
- Voice session management.
- AI agent orchestration.
- Market data.
- Research retrieval.
- Portfolio calculations.
- Order management.
- Conditional rules.
- Broker approvals.
- Notifications.

**Database**

- Users.
- Portfolios.
- Holdings.
- Orders.
- Watchlists.
- Rules.
- Approvals.
- Conversations.
- Audit events.

**Background Workers and Event Streaming**

- Celery workers consume asynchronous jobs from RabbitMQ.
- Price monitoring and conditional rule evaluation.
- Notification delivery and approval expiry.
- Retry-safe order workflow tasks and broker-status polling.
- Kafka carries durable domain events to independent consumers when event-streaming scale or multiple downstream consumers justify it.
- PostgreSQL remains the authoritative source of financial state; neither queue is the ledger.

The AI agent must call controlled backend tools. It must not have direct database write access or unrestricted authority to execute financial actions.

**Transaction consistency:** Financial state changes must be committed in PostgreSQL transactions. Queue messages trigger work and distribute events; they do not establish whether a trade or payment succeeded. Use a transactional outbox to publish committed domain events reliably.



---



## 6. Database Design

The following tables form the initial relational model.

| **Table**         | **Important fields**                                       |
| ----------------- | ---------------------------------------------------------- |
| users             | id, name, email, password_hash, preferred_language         |
| portfolios        | id, user_id, available_balance                             |
| holdings          | id, portfolio_id, symbol, quantity, average_price          |
| watchlists        | id, user_id, name                                          |
| watchlist_items   | id, watchlist_id, symbol                                   |
| orders            | id, user_id, symbol, side, quantity, order_type, status    |
| conditional_rules | id, user_id, symbol, condition, target_price, status       |
| approvals         | id, user_id, order_id, status, expires_at                  |
| conversations     | id, user_id, channel, created_at                           |
| messages          | id, conversation_id, role, content, created_at             |
| notifications     | id, user_id, type, message, read_at                        |
| audit_events      | id, actor_id, event_type, entity_id, timestamp, event_hash |
| idempotency_keys  | scope, key, request_hash, status, response_ref, created_at, expires_at |
| ledger_accounts   | id, portfolio_id, account_type, currency, status |
| ledger_entries    | id, transaction_id, account_id, debit, credit, created_at |
| outbox_events     | id, aggregate_type, aggregate_id, event_type, payload, created_at, published_at |
| consumer_inbox    | consumer_name, event_id, processed_at |
| user_dictionary   | id, user_id, spoken_term, mapped_value, language, pronunciation_hint, created_at, updated_at |
| keyword_mappings  | id, source_term, language, english_term, category          |
| user_voice_preferences | user_id, preferred_language, preferred_response_language, updated_at |

Use foreign keys, indexes and appropriate constraints. Store timestamps consistently in UTC and display them in the user's local timezone.

Order and audit records should be append-oriented. Do not silently overwrite the history of a financial action. Add unique constraints for idempotency scope/key, broker order references and consumer inbox event IDs. Financial ledger entries must be immutable; corrections should be compensating entries rather than edits.



---



## 7. API Design

Initial API routes:

| **Method** | **Endpoint**                      | **Purpose**                    |
| ---------- | --------------------------------- | ------------------------------ |
| POST       | /api/auth/register                | Register user                  |
| POST       | /api/auth/login                   | Authenticate user              |
| GET        | /api/dashboard                    | Retrieve dashboard data        |
| GET        | /api/market/indices               | Retrieve market indices        |
| GET        | /api/market/stocks/{symbol}       | Retrieve stock information     |
| GET        | /api/portfolio                    | Retrieve portfolio             |
| GET        | /api/watchlist                    | Retrieve watchlist             |
| POST       | /api/assistant/message            | Submit assistant request       |
| POST       | /api/voice/session                | Create temporary voice session |
| POST       | /api/orders/preview               | Prepare an order               |
| POST       | /api/orders/{id}/approve          | Approve a pending order        |
| POST       | /api/orders/{id}/reject           | Reject a pending order         |
| GET        | /api/orders                       | Retrieve order history         |
| POST       | /api/rules                        | Create conditional rule        |
| GET        | /api/rules                        | Retrieve conditional rules     |
| DELETE     | /api/rules/{id}                   | Delete conditional rule        |
| POST       | /api/education/explain            | Explain a financial term       |
| GET        | /api/notifications                | Retrieve notifications         |
| GET        | /api/voice-profile                | Retrieve user's voice profile  |
| PUT        | /api/voice-profile                | Update language and voice preferences |
| GET        | /api/voice-profile/dictionary     | Retrieve personal dictionary   |
| POST       | /api/voice-profile/dictionary     | Add a personal dictionary entry |
| PATCH      | /api/voice-profile/dictionary/{id}| Edit a personal dictionary entry |
| DELETE     | /api/voice-profile/dictionary/{id}| Delete a personal dictionary entry |
| GET        | /api/broker/requests              | Retrieve broker requests       |
| POST       | /api/broker/requests/{id}/approve | Approve broker request         |

All protected routes must verify the authenticated user and permissions. Approval endpoints must validate expiry, ownership and current request status.

For financial write endpoints, accept an `Idempotency-Key` header and persist its result against the authenticated user, operation and canonical request hash. Repeated requests with the same key and same payload return the original result; reuse with a different payload is rejected. Do not rely on an in-memory cache for financial idempotency.

**Requirement:**

TradeFlow must start successfully without any external API credentials.

- The frontend and backend must initialise without API keys.
- The dashboard must load without external services.
- Missing API keys must not crash the application.
- Each external integration must independently check whether its credentials are configured.
- Display a clear "API key not configured" message when a feature requires a missing key.



---



## 8. AI Agent Design

### 8.1 Agent Responsibilities

The AI agent should:

- Understand natural-language requests.
- Identify user intent.
- Extract relevant entities and numbers.
- Ask clarification questions.
- Call approved backend tools.
- Explain retrieved information.
- Generate structured action previews.

### 8.2 Agent Tools

The initial tool set should include:

- get_market_price(symbol)
- get_stock_information(symbol)
- search_market_news(query)
- get_portfolio(user_id)
- get_watchlist(user_id)
- get_user_voice_profile(user_id)
- resolve_user_stock_alias(user_id, spoken_term, language)
- prepare_order(user_id, symbol, side, quantity, order_type)
- create_price_alert(user_id, symbol, condition, target_price)
- explain_financial_term(term, language)

The order tool only prepares an order. A separate deterministic approval and order service handles submission.

### 8.3 AI Response Structure

The agent should return a structured response with fields such as:

- intent
- message
- language
- requires_clarification
- clarification_question
- action_type
- action_payload
- requires_approval
- sources
- ui_action (allowlisted frontend action such as `STAY` or `OPEN_PORTFOLIO`)
- route_target (optional allowlisted application route)
- extracted_entities (typed canonical fields and confidence/validation status where available)
- original_language and normalized_text_language (for traceability; do not expose internal fields unnecessarily in the UI)

The frontend must validate `ui_action` and `route_target` against a fixed route map. Unknown values default to `STAY`; arbitrary URLs supplied by the model are never followed.

This structure allows the frontend to display the correct component without trying to interpret arbitrary AI-generated text.

### 8.4 AI Safety Rules

- Never invent market prices.
- Never invent company announcements.
- Never invent portfolio holdings.
- Never execute an order directly.
- Never assume missing quantities.
- Never treat voice transcription as authentication.
- Never make a financial action without explicit approval.
- Clearly distinguish facts, estimates and explanations.



---



## 9. Error Handling

| **Scenario**                | **Expected behaviour**                                  |
| --------------------------- | ------------------------------------------------------- |
| Background noise            | Ask user to repeat                                      |
| Unclear stock name          | Show possible matches                                   |
| Missing quantity            | Ask how many shares                                     |
| Invalid quantity            | Explain the issue                                       |
| Unknown stock               | Ask the user to verify the symbol                       |
| Insufficient demo balance   | Reject order preview                                    |
| Market data unavailable     | Show unavailable status                                 |
| Old market data             | Display its timestamp                                   |
| Wispr unavailable           | Offer supported fallback                                |
| Microphone denied           | Offer typed input                                       |
| AI provider unavailable     | Show service unavailable and preserve manual navigation |
| Research API not configured | Show "API not set" and offer predefined queries         |
| Rule price feed unavailable | Pause evaluation and report stale data                  |
| Approval expired            | Require a new approval                                  |
| Duplicate approval          | Return existing order state                             |
| Unauthorized client         | Reject the request and log the event                    |



---



## 10. Hackathon MVP Scope

All features listed under **Must Have** are required parts of the TradeFlow MVP. There is no optional or secondary feature tier within the MVP. The implementation plan may sequence delivery, but every listed capability must be completed and tested before the MVP is considered complete.

**Must Have**

- Dashboard with clearly labelled demo data or available market data.
- Floating voice assistant.
- Voice transcription through Wispr Flow when configured.
- Typed fallback.
- Intent detection.
- Stock research with source references and predefined knowledge-based queries.
- Portfolio summary.
- Order preview and approval.
- Simulated order processing.
- Conditional price alerts.
- Click-to-explain financial terms with voice playback.
- Multiple language support.
- Hands-Free Mode with Sarvam or Windows text-to-speech, including spoken order summaries and explicit voice approval within an authenticated, active user session only.
- Voice profile (personal dictionary and frequently traded shares) and keyword mapping.
- Broker Console.
- Advanced portfolio analytics.
- More detailed charts.
- Docker Compose setup.
- Public GitHub repository.
- README and environment configuration.
- Working demonstration.

**Post-MVP / Production Scope**

The following capabilities are not part of the hackathon MVP because they require external broker authorisation, production infrastructure, regulatory review or additional platform work. They remain planned product requirements for a production release:

- Real broker API integration.
- Actual exchange order execution.
- Production-grade broker and client onboarding.
- Advanced algorithmic strategies.
- Expanded language coverage beyond the MVP language set.
- Telegram agent integration.
- WhatsApp agent integration.
- Mobile applications.
- Production security and compliance review.



---



## 11. External Dependencies and Fallbacks

| **Dependency**          | **Purpose**                          | **Fallback**                                                                 |
| ----------------------- | ------------------------------------ | ---------------------------------------------------------------------------- |
| Wispr Flow              | Speech-to-text                       | Browser speech recognition where supported, then typed input                 |
| Sarvam TTS              | Spoken responses in Indian languages | Windows speech synthesis, then browser SpeechSynthesis                       |
| Anthropic API           | AI agent                             | Clear unavailable state and deterministic local demo flows                   |
| Market data provider    | Prices and history                   | Show unavailable state; never invent current values                          |
| News sources            | Market research                      | Predefined knowledge-based queries, or "API not set" for open-ended research |
| PostgreSQL              | Persistent storage                   | Docker Compose local database                                                |
| Browser SpeechSynthesis | Spoken responses                     | Display text response                                                        |

Telegram and WhatsApp agent integrations are Post-MVP channels. They are not required to build, test or accept the hackathon MVP. The web application remains the primary interaction channel.

The app must start and its main dashboard must work without secret keys.

Optional integrations should display a clear configuration message when their credentials are missing.

Example: "Wispr Flow is not configured. You can still use typed commands."



---



## 12. Testing and Acceptance

### 12.1 Voice Testing

Test at least 60 voice cases covering:

- English.
- Hindi.
- Hinglish.
- Kannada.
- Marathi.
- Tamil.
- Gujarati.
- Different accents.
- Background noise.
- Stock names.
- Large quantities.
- Rupee values.
- Lakh and crore values.

### 12.2 Functional Testing

Test:

- Dashboard loading.
- Stock search.
- Portfolio calculation.
- Research retrieval.
- Order preparation.
- Approval and rejection.
- Approval expiry.
- Conditional alert creation.
- Alert triggering.
- Financial term explanations.
- Voice playback.
- Broker approval.
- Hands-free order confirmation during an authenticated session.
- Query responses remain on the current page unless explicit navigation is requested.
- Explicit navigation intents open only allowlisted application routes.
- English-only commands bypass translation; single-language non-English commands use the configured smaller machine-translation model; mixed-language/code-switched commands use the LLM normalization path.
- The English normalized representation supports cross-language keyword mapping (such as buy/sell action words and number words) before structured extraction.
- Original transcript is retained separately from the English working representation.
- Translation/normalization preserves company names, ticker symbols, numeric values, prices, dates and negation; conflicts on trade-critical fields trigger clarification.
- Ticker symbols, company aliases, quantities, currency values and negation survive translation/normalization.
- Low-confidence or conflicting translation/extraction results trigger clarification.
- Users can add, edit and delete personal dictionary entries and voice preferences.
- Frequently traded/watchlisted stocks are used as ranking hints without bypassing ambiguity checks.
- Hands-free approval rejection when the session is expired, invalidated or locked.
- Reconfirmation after an order payload changes.
- Voice rejection and cancellation commands for a pending order.

### 12.3 Security Testing

Test:

- Access to another user's portfolio.
- Invalid approval tokens.
- Repeated approval requests.
- Expired sessions.
- Invalid user permissions.
- Hands-free approval attempts without an authenticated active session.
- Hands-free approval attempts after session expiry or revocation.
- Replayed or duplicate voice approval attempts.
- Approval attempts against a modified or different order payload.
- Missing or incorrect order fields.
- Prompt-injection attempts through retrieved news content.

### 12.4 MVP Completion Criteria

The MVP is considered ready when:

- A user can open the application without external secrets.
- The dashboard loads successfully.
- A user can submit a typed command.
- A configured voice provider can transcribe a voice command.
- The agent can identify common intents.
- A research response can display its sources.
- A user can prepare and approve a simulated order using the confirmation card.
- An authenticated user can prepare, review and approve a simulated order through Hands-Free Mode.
- Hands-Free Mode cannot approve an order outside an authenticated, active session.
- A user can create a conditional alert.
- A financial term can be explained and read aloud.
- The application can run through Docker Compose.
- Another developer can clone and run the repository using the README.



---



## 13. Deployment and Submission Requirements

The repository should include:

- docker-compose.yml
- .env.example
- README.md
- Backend source code.
- Frontend source code.
- Database initialisation or migration scripts.
- Seed/demo data.
- docs/SECURITY.md
- docs/DEMO_SCRIPT.md

The README must explain:

- Prerequisites.
- Installation.
- Environment variables.
- Docker startup.
- Demo account or registration process.
- How to test the main features.
- Which integrations require API keys (including Wispr Flow and Sarvam TTS).

The application must not require judges to configure external API keys just to see the dashboard and test its basic functionality.

**Demo Video**

The hackathon submission video must be no longer than three minutes.

Suggested sequence:

- 0:00–0:20 — Problem and product introduction.
- 0:20–0:50 — Voice assistant and multilingual interaction.
- 0:50–1:20 — Stock research.
- 1:20–1:50 — Order preparation and approval.
- 1:50–2:15 — Conditional alert.
- 2:15–2:35 — Financial term explanation with voice playback.
- 2:35–3:00 — Impact and closing.



---



## 14. Product Success Metrics

The MVP should measure:

- Voice transcription accuracy.
- Intent classification accuracy.
- Successful task completion rate.
- Time taken to complete common tasks.
- Percentage of users who use voice interaction.
- Financial term explanation usage.
- Research responses with valid sources.
- Order approval and rejection rates.
- User feedback and repeat usage.

The number of trades should not be treated as the only measure of success. TradeFlow should help users make informed decisions, not encourage unnecessary trading.



---



## 15. Product Vision

TradeFlow aims to make financial markets easier to access and understand for people with different levels of financial knowledge, language preferences and technical experience.

The long-term vision is to build a conversational financial platform where users can research, learn, monitor and manage their investments through natural interactions.

The goal is not simply to put a microphone on an existing trading application. It is to make the entire financial experience more accessible while ensuring that users remain informed and in control of every important decision.



---



## Updated Market Data Handling

- If market data is available, display the retrieved values and timestamp.
- If the provider fails, use clearly labelled sample data in Demo Mode.
- Never present sample prices as live market prices.
- Do not fabricate current market information.
- The dashboard must still load when the market data service is unavailable.


---

## 16. Transaction Processing, Messaging and Idempotency

### 16.1 Design Principles

TradeFlow must not depend on message-queue delivery semantics to guarantee financial correctness.

- PostgreSQL is the system of record for orders, balances, holdings, approvals and ledger entries.
- RabbitMQ is the task broker for Celery workers.
- Kafka is an event-streaming layer for distributing committed business events to independent consumers. It is not the primary financial database.
- Every financial command must be validated and committed through deterministic backend services.
- Assume messages and tasks can be delivered more than once. Consumers must be idempotent.
- Do not claim end-to-end exactly-once processing across PostgreSQL, RabbitMQ, Kafka and an external broker. Implement effectively-once business outcomes using durable state, deduplication and reconciliation.

### 16.2 RabbitMQ and Celery Responsibilities

Use RabbitMQ with Celery for asynchronous jobs, including:

- Price-rule evaluation and scheduled monitoring.
- In-app notification delivery (Telegram and WhatsApp notification adapters are Post-MVP).
- Approval expiry and cleanup.
- Research/report generation.
- Retryable order workflow steps and broker-status polling.
- Reconciliation jobs.

Queue requirements:

- Durable queues and persistent messages for critical jobs.
- Publisher confirms for publishing critical messages.
- Manual acknowledgement after successful processing.
- Retry with bounded exponential backoff and jitter.
- Dead-letter queues for messages that exhaust retries; alert and support controlled replay.
- Separate queues and worker pools for latency-sensitive order tasks and lower-priority work.
- Configure prefetch, task time limits and concurrency to prevent worker starvation.
- Do not place API keys, access tokens, full voice transcripts or unnecessary personal/financial data in queue payloads. Prefer opaque IDs and retrieve authorised data from the backend.
- Restrict RabbitMQ management and broker ports to internal networks; require authentication, TLS and least-privilege virtual-host permissions.

Celery tasks must be safe to execute more than once. A task retry must not debit a balance, create another order, send duplicate payment instructions or repeat a notification without checking durable state.

### 16.3 Kafka Responsibilities

Use Kafka only when TradeFlow needs durable event distribution, replay or multiple independent consumers. Example domain events:

- `OrderPrepared`
- `OrderApproved`
- `OrderSubmissionRequested`
- `OrderAccepted`
- `OrderRejected`
- `OrderPartiallyFilled`
- `OrderFilled`
- `OrderCancelled`
- `FundsReserved`
- `FundsReleased`
- `PaymentInitiated`
- `PaymentSucceeded`
- `PaymentFailed`
- `PortfolioUpdated`

Kafka requirements:

- Publish only events representing committed state changes.
- Use a stable event ID, schema version, event type, aggregate ID, timestamp and correlation/causation IDs.
- Key order/portfolio events by aggregate ID where per-aggregate ordering is required.
- Use schema validation and a compatibility policy for event evolution.
- Enable producer idempotence and appropriate acknowledgements; configure replication and retention according to recovery objectives.
- Consumers must record processed event IDs in a durable inbox/deduplication table before applying effects.
- Monitor consumer lag, under-replicated partitions, failed processing and dead-letter/retry paths.
- Do not assume Kafka producer transactions make a PostgreSQL transaction and Kafka publication atomic. Use the transactional outbox described below.

**Celery broker decision:** RabbitMQ is the recommended Celery broker. Do not make Kafka the Celery broker in this design. Current Celery broker documentation classifies its Kafka transport as experimental, while RabbitMQ is listed as stable. Keep Celery task execution and Kafka event streaming as separate responsibilities.

### 16.4 Transactional Outbox and Inbox

A dual-write failure can occur if the application commits an order in PostgreSQL but crashes before publishing its event, or publishes an event before the database transaction commits.

Prevent this with the transactional outbox:

1. Validate the command and authenticated user's permissions.
2. Begin a PostgreSQL transaction.
3. Lock or atomically update the relevant portfolio/account rows.
4. Insert/update the order and related immutable ledger entries.
5. Insert an outbox event in the same database transaction.
6. Commit the transaction.
7. An outbox publisher reads unpublished rows and publishes them to Kafka (and/or schedules the relevant RabbitMQ task).
8. Mark the outbox row as published only after broker confirmation. If the publisher crashes before marking it, it may publish again; consumers must deduplicate by event ID.

Each consumer uses an inbox/deduplication record with a unique constraint on `(consumer_name, event_id)`. The inbox record and the consumer's database side effect must be committed in the same transaction.

### 16.5 Idempotency for Trades and Payments

Idempotency is mandatory for order submission, approval, cancellation, funds movement and any future payment/deposit/withdrawal endpoint.

- Client sends a high-entropy `Idempotency-Key` for each logical operation.
- Scope the key to the authenticated principal, endpoint/operation and relevant account.
- Store the key, canonical request hash, processing state, resulting resource ID and response metadata in PostgreSQL.
- Enforce a database unique constraint on the scoped key.
- Same key + same request hash: return the original result or current processing state; do not repeat the side effect.
- Same key + different request hash: reject with a conflict response.
- Concurrent duplicate requests: one request claims the key atomically; the other receives the existing operation state.
- Keep records for a documented period that exceeds the maximum retry/reconciliation window. Financial records and broker references must remain auditable beyond the idempotency cache window.
- Never use a process-local dictionary or Redis-only key as the sole financial idempotency control.

For external broker/payment-provider calls, pass the same stable operation identifier as the provider's idempotency/reference key when supported. If the provider does not support idempotency, persist the outbound attempt and reconcile provider status before retrying an ambiguous timeout. Never blindly resend an order/payment after a timeout because the provider may already have accepted it.

### 16.6 Order State Machine

Implement explicit, validated state transitions. A suggested order lifecycle is:

`DRAFT → PENDING_APPROVAL → APPROVED → SUBMISSION_PENDING → SUBMITTED → PARTIALLY_FILLED → FILLED`

Alternative terminal or exception states include `REJECTED`, `CANCELLED`, `EXPIRED`, `BROKER_REJECTED` and `RECONCILIATION_REQUIRED`.

- State transitions must be performed by backend code, not the LLM or frontend.
- Use optimistic version checks or row-level locking to prevent conflicting transitions.
- Approval must be bound to the exact order payload/version shown to the user. Any material change to symbol, side, quantity, order type or price invalidates the approval and requires a new preview.
- A timeout after submission moves the order to a pending/reconciliation state, not automatically to failed.
- Broker callbacks/webhooks must be authenticated, deduplicated and checked against the expected order/account.
- Reconcile internal order state with broker/exchange reports and surface discrepancies for investigation.

### 16.7 Ledger and Balance Consistency

For any environment that represents money or buying power:

- Maintain an immutable, double-entry ledger; do not treat a mutable `available_balance` field as the sole financial record.
- Reserve funds atomically when an order is accepted for processing; release reservations on rejection, cancellation or expiry as appropriate.
- Record fills, fees, taxes and reversals as separate ledger entries.
- Use database constraints and transaction isolation/locking to prevent overspending through concurrent orders.
- Derive balances from ledger entries or maintain a transactionally updated projection that can be rebuilt and reconciled from the ledger.
- Use fixed-precision decimal types for rupee amounts and quantities where applicable; never use binary floating-point for money.
- Keep the simulated MVP clearly separated from real funds and real broker execution.

### 16.8 Suggested End-to-End Order Flow

1. Voice/typed request is converted into a structured order preview.
2. User reviews and explicitly approves the immutable preview.
3. Backend verifies session, ownership, permissions, approval expiry and order version.
4. Backend claims the idempotency key and executes a PostgreSQL transaction.
5. Transaction records approval, reserves simulated funds where applicable, creates the order transition and writes an outbox event.
6. Celery/RabbitMQ worker processes the submission task. For the MVP it updates the simulated broker adapter; production uses an authorised broker adapter.
7. Adapter records the external request/reference and handles timeouts without blind resubmission.
8. Broker result is verified and applied through a state transition; a corresponding outbox event is committed.
9. Kafka distributes committed order events to portfolio projections, notifications and analytics consumers when enabled.
10. UI displays the authoritative order status from the backend.

---

## 17. Security Architecture Review and Required Improvements

This is an architecture-level review of the PRD, not a penetration-test result or a certification. The existing PRD establishes useful foundations—backend permission checks, TLS, password hashing, approval expiry, audit events and a restriction on direct AI execution—but several controls are too general for a financial application.

### 17.1 Highest-Priority Risks

| Priority | Gap or threat | Required improvement |
| --- | --- | --- |
| Critical | Duplicate order/payment execution after retries or timeouts | Durable idempotency keys, unique constraints, transactional outbox/inbox and provider reconciliation |
| Critical | Cross-user or cross-broker data access | Enforce object-level authorization and tenant scoping in every query and mutation; never trust a client-supplied `user_id` |
| Critical | Approval replay or approval of altered order details | Single-use approval bound to order ID, version and canonical payload hash; short expiry; step-up authentication for production |
| High | Concurrent orders overspend the same balance | Atomic reservations, row locks/optimistic concurrency and immutable ledger |
| High | Session/token theft or account takeover | MFA, secure cookie/session settings, rotation, revocation, reauthentication and anomaly alerts |
| High | AI prompt injection through news, documents or tool output | Treat retrieved content as untrusted data; strict tool allowlists and server-side policy checks; no model-controlled SQL or arbitrary URLs |
| High | Broker webhook spoofing or replay | Verify signatures, timestamps and replay windows; deduplicate event IDs; reconcile with broker APIs |
| High | Queue compromise or sensitive message leakage | Private network access, TLS, least-privilege credentials, payload minimisation, rotation and queue monitoring |
| High | Secrets or sensitive data exposed through logs | Structured redacted logs, secret scanning, access controls, encryption and retention limits |
| Medium | Abuse of voice, AI and financial endpoints | Per-user/IP quotas, payload limits, concurrency limits, spend controls and abuse monitoring |
| Medium | Dependency/container compromise | Dependency pinning and scanning, image scanning, non-root containers, minimal images and controlled deployment |

### 17.2 Authentication and Session Security

- Use a maintained authentication library or identity provider; do not implement password/session cryptography manually.
- Hash passwords with Argon2id (or another currently approved password-hashing configuration).
- Require MFA or step-up authentication for sensitive account changes and production financial actions.
- Rotate session identifiers after login and privilege changes; support logout, revocation and idle/absolute expiry.
- If browser cookies are used, set `Secure`, `HttpOnly` and an appropriate `SameSite` policy. Add CSRF protection to state-changing cookie-authenticated requests.
- Keep access tokens short-lived. Store refresh tokens securely, rotate them and detect reuse.
- Do not put tokens in URLs, browser local storage by default, logs or analytics.
- Add rate limits and abuse detection to login, registration, password reset, OTP and voice-session creation.
- Require reauthentication for changing payout/bank details, changing MFA and other high-impact settings.

### 17.3 Authorization and Broker/Tenant Isolation

- Derive the acting user and tenant/broker context from the authenticated server-side identity, not request-body fields.
- Enforce authorization at the service/data-access layer, not only in frontend route guards.
- Apply object-level checks to every order, portfolio, approval, rule, notification, conversation and broker-client request.
- Define explicit roles and permissions for retail user, broker, broker staff, support, administrator and background worker.
- Broker staff must access only clients assigned to their broker organisation and only within their granted permissions.
- Prevent mass assignment: accept explicit request schemas and never bind arbitrary client JSON directly to database models.
- Use database constraints and, where appropriate, PostgreSQL row-level security as defence in depth. RLS must not replace application authorization.
- Test horizontal privilege escalation (user A accessing user B) and vertical privilege escalation (client acting as broker/admin).

### 17.4 Approval and High-Risk Action Security

- Bind an approval to the exact canonical order payload and version displayed in the confirmation UI.
- Use cryptographically random, single-use approval challenges stored server-side; store only a hash of bearer tokens where applicable.
- Check ownership, role, order state, expiry, payload hash and current limits inside the same transaction that records approval.
- Invalidate approval when any material order field changes.
- Require a fresh approval after expiry, a material edit or a change in the authenticated account context.
- Treat voice as an input method, never as proof of identity.
- For production, use step-up authentication for high-risk actions and consider broker-supported transaction authorisation controls.
- Add configurable limits for quantity, notional value, order frequency and unusual activity. Reject or route exceptional requests for manual review.

### 17.5 AI, Prompt Injection and Tool Security

- Treat user speech, transcriptions, retrieved news, web pages, uploaded documents and external API responses as untrusted input.
- Separate instructions from retrieved content and never allow retrieved content to redefine system policy.
- Expose only narrow, typed tools. The model may request `prepare_order`; it must not call a generic database write, shell, arbitrary HTTP or unrestricted broker API tool.
- Validate every tool argument with strict schemas and server-side business rules.
- Re-check authentication, ownership, limits and approval at the point of execution; an earlier LLM decision is not authorisation.
- Do not allow the model to choose arbitrary user IDs, account IDs or tenant IDs.
- Apply output validation and safe rendering to prevent stored/reflected XSS in transcripts and generated content.
- Keep deterministic calculations and financial state transitions outside the LLM.
- Log tool name, actor, resource ID, decision and correlation ID, but redact sensitive payloads.

### 17.6 API, Webhook and Network Security

- Use TLS for all public traffic and TLS for internal service/broker connections where supported.
- Configure CORS with explicit trusted origins; do not use wildcard origins with credentials.
- Validate request schemas, content types, payload sizes and numeric bounds. Reject unknown fields on sensitive write endpoints.
- Apply per-user and per-IP rate limits, plus stricter quotas for expensive AI, voice and financial operations.
- Protect external-data fetchers against SSRF: allowlist destinations, block private/link-local/metadata IP ranges, restrict redirects and enforce egress controls.
- Authenticate webhooks using provider signatures, validate timestamps and replay windows, and deduplicate provider event IDs.
- Keep RabbitMQ, Kafka, PostgreSQL and management interfaces off the public internet.
- Use network segmentation and least-privilege service identities. Workers should receive only the credentials and permissions they need.
- Maintain an inventory of public API versions, internal services, webhooks and third-party integrations.

### 17.7 Data Protection, Privacy and Audit

- Encrypt database volumes, backups and object storage; use managed key management where available and rotate keys according to policy.
- Consider field-level encryption for sensitive personal or financial identifiers.
- Define data retention and deletion rules for voice audio, transcripts, conversations, identity data and logs. Avoid retaining raw audio unless required and explicitly disclosed.
- Do not log passwords, access/refresh tokens, API keys, full payment details, authentication challenges or unnecessary personal data.
- Restrict audit-log access; make financial audit events append-only and tamper-evident. Hash chaining can provide tamper evidence but is not a substitute for access control or immutable backups.
- Record actor, action, resource, timestamp, outcome, request/correlation ID and relevant before/after state references.
- Keep operational logs, security logs and financial audit records logically separate with defined retention and access policies.
- Document privacy notices, user consent and data-subject handling before production deployment.

### 17.8 Database, Infrastructure and Supply-Chain Security

- Use separate database roles for migrations, application reads/writes, workers and reporting. The application must not connect as a superuser.
- Use parameterised SQL/ORM queries and review raw SQL.
- Require encrypted backups and periodically test restoration.
- Define recovery point objective (RPO), recovery time objective (RTO), backup frequency and disaster-recovery procedures.
- Run containers as non-root, use minimal pinned images, drop unnecessary Linux capabilities and keep secrets out of image layers.
- Pin dependencies, scan for known vulnerabilities, generate an SBOM and review critical upgrades.
- Protect CI/CD with least-privilege credentials, protected branches, reviewed changes and secret scanning.
- Separate development, staging and production credentials, data and infrastructure.
- Add dependency, container and infrastructure configuration scanning to CI.

### 17.9 Observability and Incident Response

Monitor and alert on:

- Repeated authentication failures, MFA failures and suspicious session reuse.
- Cross-tenant authorization denials and privilege changes.
- Duplicate idempotency-key conflicts and abnormal order retry rates.
- Orders stuck in pending/submission/reconciliation states.
- Differences between internal ledger/balance projections and broker reports.
- Queue depth, dead-letter volume, task retry rate and worker failures.
- Kafka consumer lag, outbox backlog and event-processing failures.
- Unusual AI/voice usage, provider cost spikes and rate-limit violations.
- Database connection saturation, backup failures and service availability.

Create an incident runbook for account takeover, suspected unauthorised orders, broker outage, queue compromise, data exposure and ledger mismatch. Include the ability to disable order submission independently of market research and read-only dashboard functionality.

### 17.10 Security Testing Requirements

Expand the existing security test plan to include:

- BOLA/IDOR tests across every user-, broker- and account-scoped resource.
- Role escalation and broker-tenant isolation tests.
- CSRF, XSS, SQL injection, SSRF and CORS misconfiguration tests.
- Session fixation, token theft/reuse, logout/revocation and password-reset abuse tests.
- Approval replay, altered-payload approval, expired approval and concurrent approval tests.
- Duplicate requests with identical and conflicting idempotency keys.
- Worker crash/retry tests at every order-processing step.
- Outbox publisher crash after publish but before marking the event as published.
- Duplicate, delayed and out-of-order Kafka/RabbitMQ message tests.
- Broker timeout after provider acceptance, webhook replay and reconciliation mismatch tests.
- Concurrent orders attempting to reserve the same available balance.
- Prompt injection through news content and malicious tool output.
- Rate-limit bypass, resource exhaustion and AI-cost abuse tests.
- Backup restoration and disaster-recovery exercises.

### 17.11 Production Readiness Gates

Do not connect real brokerage accounts or process real funds until all of the following are complete:

1. Independent security review and penetration test with critical/high findings remediated.
2. Broker API authorisation, order lifecycle, reconciliation and failure-handling tests.
3. Durable idempotency and ledger consistency tests under concurrent load and injected failures.
4. MFA, step-up authentication, role/tenant isolation and audit controls.
5. Monitoring, incident response, backup restoration and disaster-recovery validation.
6. Legal/compliance review for applicable Indian securities, broker, exchange, privacy and cybersecurity obligations.
7. Documented operational ownership, support escalation and rollback procedures.

The hackathon MVP should remain in simulated trading mode. Real execution is a separate production milestone, not a configuration toggle.

---

## 18. Revised Implementation Plan

### Phase 1 — Secure Modular MVP

- Keep the FastAPI application modular; do not split into microservices prematurely.
- Keep PostgreSQL as the source of truth.
- Implement order state transitions, approval binding and idempotency in the application/database first.
- Add a durable ledger model for simulated funds if the demo updates balances.
- Add RabbitMQ and Celery for background tasks that genuinely need asynchronous execution.
- Implement retry-safe tasks, dead-letter handling and task monitoring.
- Add security basics: object-level authorization, secure sessions, rate limits, secrets management, audit redaction and automated tests.
- Do not add Kafka unless the MVP has a real event-streaming use case.

### Phase 2 — Reliable Event-Driven Processing

- Implement the transactional outbox and consumer inbox.
- Add Kafka for committed domain events when multiple consumers, replay or independent event processing become necessary.
- Add portfolio projections, notification consumers and reconciliation consumers.
- Add queue/event observability and operational runbooks.
- Test duplicate delivery, ordering, worker restarts and partial failures.

### Phase 3 — Production Brokerage Readiness

- Integrate an authorised broker adapter.
- Implement provider idempotency/reference handling and broker reconciliation.
- Add MFA/step-up authentication and production risk limits.
- Complete independent penetration testing, compliance review and disaster-recovery testing.
- Enable real execution only after production readiness gates are met.

### Recommended MVP Deployment Topology

```text
React / PWA
    |
    | HTTPS
    v
FastAPI Modular Backend
    |-- Authentication & Authorization
    |-- AI Orchestrator (no direct DB writes)
    |-- Order / Approval Service
    |-- Portfolio & Ledger Service
    |-- Market / Research Service
    |-- Broker Adapter (simulated in MVP)
    |
    +---------- PostgreSQL
    |             |-- Orders / Approvals
    |             |-- Portfolios / Holdings
    |             |-- Ledger
    |             |-- Idempotency Records
    |             |-- Outbox / Inbox
    |             |-- Audit Events
    |
    +---------- RabbitMQ
    |             |
    |             +-- Celery Workers
    |                    |-- Notifications
    |                    |-- Price Rules
    |                    |-- Approval Expiry
    |                    |-- Order Workflow Tasks
    |
    +---------- Kafka (Phase 2)
                  |-- Order Domain Events
                  |-- Portfolio Projection
                  |-- Notifications
                  |-- Analytics / Reconciliation
```

**Architecture decision:** For the hackathon, implement PostgreSQL + RabbitMQ + Celery first. Design event schemas and the outbox so Kafka can be introduced later without rewriting the order service. Running both RabbitMQ and Kafka from day one adds operational complexity without automatically improving correctness.

---

## 19. Hands-Free Voice Trading and Broker-Client Approval Workflow

### 19.1 Purpose and Scope

Hands-Free Mode allows an authenticated client to prepare, review, approve or decline an order through spoken interaction without needing to click the approval card. It extends the existing voice-first assistant; it does not remove the requirement for explicit approval or backend validation.

Hands-Free Mode is available only inside an authenticated, active user session. A voice command, voiceprint or successful speech transcription must never establish identity, log a user in, unlock an expired session or replace step-up authentication.

For the hackathon MVP, the workflow operates against the simulated order service. Production execution requires an authorised broker integration and completion of the production readiness requirements in Section 18.

### 19.2 Client Workflow: Voice Command to Order Result

1. **Authenticate:** The client signs in through the normal authentication flow. Hands-Free Mode is enabled only while the server recognises the session as authenticated and active.
2. **Start voice interaction:** The client activates the microphone or an explicitly enabled hands-free listening session. The interface indicates when it is listening. The client may use typed input or the standard confirmation card as alternatives.
3. **Submit an order request:** The client speaks a request, for example, "Buy 10 shares of Infosys at market price."
4. **Interpret the request:** Speech-to-text produces a transcript. The AI extracts the symbol, side, quantity, order type and price instruction. If information is missing or ambiguous, the assistant asks a clarification question; it must not guess.
5. **Validate:** The backend validates the instrument, quantity, supported order type, market/session constraints, account permissions, configured limits and available funds.
6. **Read back the complete order:** TradeFlow speaks the order summary, including stock and ticker, buy/sell side, quantity, order type, indicative price, estimated value, applicable charges when available and approval expiry. The same canonical order details must be visible in the UI.
7. **Obtain explicit voice approval:** TradeFlow asks the client to confirm or decline. The client must provide an unambiguous confirmation in the context of that pending order. Silence, background speech, an ambiguous response or a transcription with insufficient confidence must not approve the order. The user can instead approve or decline using the on-screen controls.
8. **Verify approval server-side:** The backend verifies the authenticated session, user and account ownership, pending order ID and version, exact canonical payload hash, approval expiry, current order state and applicable limits. These checks and the approval-state change must be performed atomically.
9. **Process the approved order:** The MVP submits the approved order to the simulated order service. A production deployment routes it through the authorised broker adapter. The AI agent itself never submits or executes the order.
10. **Speak and display the result:** TradeFlow announces the authoritative result returned by the order service and displays the current order status. A timeout or uncertain broker response must be reconciled; it must not trigger a blind duplicate submission.

### 19.3 Authenticated-Session-Only Rules

The following rules are mandatory:

- Hands-Free Mode must be disabled until the user has completed normal authentication.
- Every voice approval must be associated with the currently authenticated user, account, session and exact pending order.
- The backend, not the frontend or AI agent, is authoritative for session validity and approval.
- If the session expires, is revoked, becomes locked or otherwise ceases to be active, voice approval must immediately be rejected. The user must re-authenticate through the normal authentication flow before continuing.
- Re-authentication must not automatically approve or submit an order that was pending before the session interruption. The user must review the current order preview and explicitly approve it again.
- Voice recognition and voice matching must not be treated as identity verification or as a substitute for MFA or step-up authentication.
- An affirmative phrase is valid only when there is a current, unexpired pending approval challenge for the exact order being discussed. A general "yes" outside that context must have no financial effect.
- If the transcript is ambiguous, confidence is insufficient, multiple pending orders could match, or the user changes an order field, do not approve. Ask for clarification or generate a new preview and approval challenge.
- Approval expires after the configured approval window (five minutes under FR-05). Expired approvals require a new preview and explicit approval.
- The user must always retain visible approve, decline and cancel controls. Hands-Free Mode must not be the only way to control an order.

### 19.4 Broker-Client Workflow

The Broker Console supports a separate broker-side review workflow. Client approval and broker approval are distinct decisions; one must not be treated as a substitute for the other.

1. **Client submits a request:** The client prepares an order request through the TradeFlow assistant and completes the required client approval.
2. **Backend verifies routing and permissions:** The backend checks the authenticated client, broker-client relationship, account mapping and whether broker review is required by the configured workflow.
3. **Broker receives the request:** The request appears in the authorised broker's Broker Console with the client reference and structured order details.
4. **Broker reviews:** The broker checks the stock, side, quantity, order type, price instruction, account and relevant limits.
5. **Broker decides:** The broker approves or rejects the request through an authenticated broker session. The decision, actor, timestamp and request version are audited.
6. **Backend enforces the decision:** If broker approval is required, the order cannot proceed to submission until the required broker approval has been recorded against the same order version and payload. A material change invalidates prior approval and requires review again.
7. **Order processing:** Once all required approvals are present, the deterministic order service processes the request through the simulated adapter in the MVP or the authorised broker adapter in production.
8. **Both parties receive status:** The client receives the outcome; the broker can see the request and order history within their authorised scope.

Broker-side voice interaction, if later enabled, must follow the same authenticated-session and explicit-approval principles. The initial hands-free requirement in this PRD applies to the authenticated client workflow; it does not imply that broker approvals can be made by voice.

### 19.5 Order Approval and State Controls

- Bind each approval to the immutable order version and canonical payload shown to the client or broker.
- Store the approval challenge server-side and make it single-use.
- Enforce ownership, role, session validity, expiry, payload hash and order state inside the transaction that records approval.
- Invalidate approval after a material change to symbol, side, quantity, order type, price instruction, account or other execution-relevant field.
- Use the existing idempotency controls in Section 16.5 to prevent duplicate approvals or submissions.
- Record the approval method (`UI` or `VOICE`), actor, session reference, order version, timestamp and decision in the audit trail. Do not store raw audio by default; apply the data-retention and privacy rules in Section 17.7.
- Keep broker approval, client approval and system validation as separate recorded conditions where the configured workflow requires them.

### 19.6 Acceptance Criteria and Tests

The implementation is acceptable when:

- An unauthenticated user cannot enable Hands-Free Mode or approve an order by voice.
- An authenticated client can request an order, hear the complete order summary and explicitly approve or decline it by voice.
- The same order can be approved or declined through the UI if voice input is unavailable.
- Session expiry, revocation or locking causes voice approval to fail closed.
- Re-authentication does not silently resume or approve a pending order.
- Ambiguous speech, low-confidence transcription, silence and unrelated speech never approve an order.
- A voice approval for one order cannot approve another order.
- Any material order edit invalidates the previous approval.
- Repeated or replayed approval requests cannot create duplicate orders.
- Client and broker approvals are separately enforced and audited when both are required.
- The user receives the authoritative order status, including pending, rejected, partially filled, filled or reconciliation-required states where supported.

---

## 20. Architecture References

- Celery broker documentation: https://docs.celeryq.dev/en/stable/getting-started/backends-and-brokers/
- Celery first steps and broker selection: https://docs.celeryq.dev/en/stable/getting-started/first-steps-with-celery.html
- OWASP API Security Top 10: https://owasp.org/www-project-api-security/
- OWASP Application Security Verification Standard: https://owasp.org/www-project-application-security-verification-standard/
- OWASP Session Management guidance: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html

These references are implementation guidance. They do not establish that TradeFlow is compliant or secure without verification and testing.
