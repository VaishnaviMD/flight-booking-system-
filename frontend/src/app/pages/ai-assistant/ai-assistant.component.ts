import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChatService, ChatMessageItem } from '../../services/chat.service';

interface DisplayChatMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  model?: string;
  flightSuggestions?: any[];
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="assistant-page container">
      <!-- Left Sidebar Suggested Topics -->
      <aside class="sidebar-card">
        <div class="sidebar-header">
          <h3>SkyFlow AI Assistant</h3>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <span class="ai-chip">Ollama 3.2</span>
            <span class="ai-chip" style="background: rgba(37,99,235,0.15); color: #38bdf8; border-color: rgba(56,189,248,0.3);">MCP Tools</span>
          </div>
        </div>

        <div class="topic-group">
          <span class="group-title">QUICK FLIGHT QUESTIONS</span>
          <button (click)="sendPreset('What are the baggage allowance rules for Economy and Business?')" class="topic-btn">
            <span class="material-icons icon">luggage</span> Baggage Rules
          </button>
          <button (click)="sendPreset('How do ticket cancellations and refund policies work?')" class="topic-btn">
            <span class="material-icons icon">event_busy</span> Cancellation & Refund
          </button>
          <button (click)="sendPreset('What flights are available from Delhi to Mumbai?')" class="topic-btn">
            <span class="material-icons icon">flight_takeoff</span> Delhi to Mumbai Flights
          </button>
          <button (click)="sendPreset('How is passenger age calculated during booking?')" class="topic-btn">
            <span class="material-icons icon">calculate</span> Age Calculation
          </button>
        </div>

        <div class="topic-group">
          <span class="group-title">TEST GUARDRAILS (REFUSALS)</span>
          <button (click)="sendPreset('Can I book a train ticket from Delhi to Mumbai?')" class="topic-btn" style="border-color: rgba(239, 68, 68, 0.3);">
            <span class="material-icons icon" style="color: #f87171;">train</span> Train Booking Query
          </button>
          <button (click)="sendPreset('Are there any cruise ship journeys to Goa?')" class="topic-btn" style="border-color: rgba(239, 68, 68, 0.3);">
            <span class="material-icons icon" style="color: #f87171;">directions_boat</span> Ship / Cruise Query
          </button>
        </div>

        <div class="topic-group">
          <span class="group-title">CHAT ACTIONS</span>
          <button (click)="clearChat()" class="recent-chat">
            <span class="material-icons icon">delete_sweep</span> Clear Conversation
          </button>
        </div>
      </aside>

      <!-- Main Chat Area -->
      <main class="chat-card">
        <header class="chat-header">
          <div class="bot-badge">
            <span class="material-icons bot-icon">smart_toy</span>
            <div>
              <h2>SkyFlow AI Flight Guide</h2>
              <span class="online-indicator">● ONLINE · MCP TOOLS ENABLED</span>
            </div>
          </div>
          <span class="model-badge" *ngIf="activeModel">{{ activeModel }}</span>
        </header>

        <!-- Messages Area -->
        <div class="messages-container" #messagesContainer>
          <div *ngFor="let msg of messages" class="message-row" [class.user-row]="msg.sender === 'user'">
            <div class="message-bubble" [class.user-bubble]="msg.sender === 'user'">
              <div class="message-content" [innerHTML]="formatMessage(msg.text)"></div>

              <!-- Suggested Flight Cards if returned -->
              <div *ngIf="msg.flightSuggestions && msg.flightSuggestions.length > 0" class="flight-suggestions">
                <span class="sugg-title">MATCHING FLIGHTS</span>
                <div *ngFor="let f of msg.flightSuggestions" class="flight-mini-card">
                  <div class="f-info">
                    <strong>{{ f.airlineName }} ({{ f.flightNumber }})</strong>
                    <span>{{ f.originCode }} ➔ {{ f.destinationCode }} · {{ f.departureTime | date:'shortTime' }}</span>
                  </div>
                  <div class="f-action">
                    <strong class="f-price">₹{{ f.basePrice }}</strong>
                    <a [routerLink]="['/booking', f.id]" class="btn btn-primary btn-xs">Book</a>
                  </div>
                </div>
              </div>

              <span class="timestamp">{{ msg.timestamp }}</span>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div *ngIf="loading" class="message-row">
            <div class="message-bubble typing-bubble">
              <div class="typing-dots">
                <span></span><span></span><span></span>
              </div>
              <span class="typing-text">SkyFlow AI is preparing flight information...</span>
            </div>
          </div>
        </div>

        <!-- Chat Input Bar -->
        <div class="input-bar">
          <input type="text" 
                 [(ngModel)]="userInput" 
                 (keyup.enter)="sendMessage()" 
                 [disabled]="loading"
                 placeholder="Ask about flight schedules, baggage, fares, cancellations..." />
          <button (click)="sendMessage()" [disabled]="loading || !userInput.trim()" class="send-btn">
            <span class="material-icons">send</span>
          </button>
        </div>
        <p class="ai-disclaimer">SkyFlow AI Guide is dedicated to flight bookings, baggage policies, and airline travel assistance.</p>
      </main>
    </div>
  `,
  styles: [`
    .assistant-page {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 24px;
      padding: 40px 24px;
      min-height: calc(100vh - 120px);
    }
    .sidebar-card {
      background: var(--surface-bg);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-color);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;

      .sidebar-header {
        display: flex;
        flex-direction: column;
        gap: 6px;
        h3 { font-size: 1.25rem; font-weight: 800; }
        .ai-chip {
          display: inline-block;
          align-self: flex-start;
          background: rgba(0, 220, 130, 0.15);
          color: var(--accent-color);
          font-size: 0.72rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 12px;
          border: 1px solid rgba(0, 220, 130, 0.3);
        }
      }
    }
    .topic-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .group-title {
      font-size: 0.72rem;
      font-weight: 800;
      color: var(--text-dim);
      letter-spacing: 0.05em;
    }
    .topic-btn, .recent-chat {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--surface-card);
      border: 1px solid var(--border-color);
      color: var(--text-muted);
      padding: 10px 14px;
      border-radius: var(--radius-md);
      font-size: 0.88rem;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s;

      &:hover {
        background: #1c2847;
        color: var(--text-main);
        border-color: var(--accent-color);
      }
      .icon { font-size: 18px; color: var(--accent-color); flex-shrink: 0; }
    }
    .chat-card {
      background: var(--surface-bg);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: var(--shadow);
    }
    .chat-header {
      padding: 18px 24px;
      border-bottom: 1px solid var(--border-color);
      background: var(--surface-card);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .bot-badge {
      display: flex;
      align-items: center;
      gap: 14px;

      h2 { font-size: 1.15rem; font-weight: 800; margin: 0; }
    }
    .bot-icon {
      font-size: 28px;
      color: var(--accent-color);
      background: rgba(0, 220, 130, 0.1);
      padding: 8px;
      border-radius: 12px;
    }
    .online-indicator {
      font-size: 0.72rem;
      font-weight: 800;
      color: var(--accent-color);
      letter-spacing: 0.05em;
    }
    .model-badge {
      font-size: 0.75rem;
      color: var(--text-dim);
      background: rgba(255, 255, 255, 0.05);
      padding: 4px 10px;
      border-radius: 12px;
      border: 1px solid var(--border-color);
    }
    .messages-container {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 18px;
      max-height: 520px;
    }
    .message-row {
      display: flex;

      &.user-row {
        justify-content: flex-end;
      }
    }
    .message-bubble {
      background: var(--surface-card);
      border: 1px solid var(--border-color);
      padding: 16px 20px;
      border-radius: 16px;
      max-width: 680px;
      font-size: 0.95rem;
      line-height: 1.6;
      color: var(--text-main);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);

      &.user-bubble {
        background: var(--accent-color);
        color: #0b1329;
        font-weight: 600;
        border: none;
        box-shadow: 0 4px 15px var(--accent-glow);

        .timestamp { color: rgba(11, 19, 41, 0.7); }
      }
    }
    .message-content {
      white-space: pre-wrap;
      word-break: break-word;

      strong {
        color: var(--accent-color);
      }
    }
    .user-bubble .message-content strong {
      color: #0b1329;
      font-weight: 800;
    }
    .timestamp {
      display: block;
      font-size: 0.7rem;
      margin-top: 8px;
      color: var(--text-dim);
    }
    .typing-bubble {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
    }
    .typing-dots {
      display: flex;
      gap: 4px;
      span {
        width: 8px;
        height: 8px;
        background: var(--accent-color);
        border-radius: 50%;
        animation: blink 1.4s infinite both;
        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
      }
    }
    .typing-text {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    @keyframes blink {
      0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
      40% { opacity: 1; transform: scale(1); }
    }
    .flight-suggestions {
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid var(--border-color);
      .sugg-title {
        display: block;
        font-size: 0.7rem;
        font-weight: 800;
        color: var(--accent-color);
        margin-bottom: 8px;
        letter-spacing: 0.05em;
      }
    }
    .flight-mini-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--surface-bg);
      border: 1px solid var(--border-color);
      padding: 10px 14px;
      border-radius: 8px;
      margin-bottom: 8px;

      .f-info {
        display: flex;
        flex-direction: column;
        strong { font-size: 0.9rem; color: var(--text-main); }
        span { font-size: 0.78rem; color: var(--text-muted); }
      }
      .f-action {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .f-price {
        color: var(--accent-color);
        font-size: 1rem;
      }
    }
    .btn-xs {
      padding: 4px 10px;
      font-size: 0.75rem;
    }
    .input-bar {
      display: flex;
      padding: 16px 24px;
      gap: 12px;
      background: var(--surface-card);
      border-top: 1px solid var(--border-color);

      input {
        flex: 1;
        padding: 12px 18px;
        background: var(--input-bg);
        border: 1px solid var(--border-color);
        border-radius: 24px;
        color: var(--text-main);
        font-size: 0.95rem;

        &:focus { outline: none; border-color: var(--accent-color); }
      }
    }
    .send-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--accent-color);
      color: #0b1329;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &:hover:not(:disabled) { background: var(--accent-hover); }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
    }
    .ai-disclaimer {
      font-size: 0.72rem;
      color: var(--text-dim);
      text-align: center;
      padding: 8px 0 14px;
    }
  `]
})
export class AiAssistantComponent implements OnInit {
  private chatService = inject(ChatService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  userInput = '';
  loading = false;
  activeModel = 'llama3.2:1b';

  messages: DisplayChatMessage[] = [
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I am your SkyFlow AI Flight Guide powered by Ollama.\n\nI can answer questions regarding flight bookings, airline baggage allowances, cancellation & refund policies, seat selection, and airport information.\n\nHow can I help you with your journey today?",
      timestamp: this.formatCurrentTime()
    }
  ];

  ngOnInit() {
    this.scrollToBottom();
  }

  sendMessage() {
    if (!this.userInput.trim() || this.loading) return;

    const userText = this.userInput.trim();
    this.messages.push({
      id: this.messages.length + 1,
      sender: 'user',
      text: userText,
      timestamp: this.formatCurrentTime()
    });
    this.userInput = '';
    this.loading = true;
    this.cdr.detectChanges();
    this.scrollToBottom();

    // Prepare history
    const history: ChatMessageItem[] = this.messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    this.chatService.sendMessage({ message: userText, history }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.model) {
          this.activeModel = res.model;
        }
        this.messages.push({
          id: this.messages.length + 1,
          sender: 'ai',
          text: res.reply,
          timestamp: this.formatCurrentTime(),
          model: res.model,
          flightSuggestions: res.flightSuggestions
        });
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      error: (err) => {
        this.loading = false;
        this.messages.push({
          id: this.messages.length + 1,
          sender: 'ai',
          text: "I am SkyFlow's Flight Assistant. I encountered a temporary connection issue. You can check baggage rules, search flights, or manage your bookings from the top menu.",
          timestamp: this.formatCurrentTime()
        });
        this.cdr.detectChanges();
        this.scrollToBottom();
      }
    });
  }

  sendPreset(text: string) {
    this.userInput = text;
    this.sendMessage();
  }

  clearChat() {
    this.messages = [
      {
        id: 1,
        sender: 'ai',
        text: "Conversation cleared. Hello! I am your SkyFlow AI Flight Guide. What flight information can I assist you with?",
        timestamp: this.formatCurrentTime()
      }
    ];
    this.cdr.detectChanges();
  }

  formatMessage(text: string): string {
    if (!text) return '';
    // Bold formatting: **text** -> <strong>text</strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return formatted;
  }

  private formatCurrentTime(): string {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.messagesContainer) {
          this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
        }
      } catch (err) {}
    }, 100);
  }
}
