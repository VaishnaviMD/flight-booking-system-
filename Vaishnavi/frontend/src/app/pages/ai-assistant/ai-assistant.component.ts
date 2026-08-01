import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  flightWidget?: {
    flightNumber: string;
    origin: string;
    originCity: string;
    destination: string;
    destinationCity: string;
    duration: string;
    departureTime: string;
    gate: string;
    status: 'On Time' | 'Delayed' | 'Boarding';
  };
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="assistant-page container">
      <!-- Left Sidebar Suggested Topics -->
      <aside class="sidebar-card">
        <h3>Assistant</h3>

        <div class="topic-group">
          <span class="group-title">SUGGESTED HELP TOPICS</span>
          <button (click)="sendPreset('Check my flight status for upcoming trip')" class="topic-btn">
            <span class="material-icons icon">flight</span> Check Flight Status
          </button>
          <button (click)="sendPreset('What are the cabin baggage allowances?')" class="topic-btn">
            <span class="material-icons icon">luggage</span> Baggage Rules
          </button>
          <button (click)="sendPreset('How can I rebook or change seats on my flight?')" class="topic-btn">
            <span class="material-icons icon">event_repeat</span> Rebook Flight
          </button>
        </div>

        <div class="topic-group">
          <span class="group-title">RECENT CHATS</span>
          <button (click)="sendPreset('Flight to London JFK-LHR')" class="recent-chat">
            <span class="material-icons icon">history</span> Flight to London
          </button>
          <button (click)="sendPreset('Extra baggage policy for international flights')" class="recent-chat">
            <span class="material-icons icon">history</span> Extra Baggage
          </button>
        </div>
      </aside>

      <!-- Main Chat Area -->
      <main class="chat-card">
        <header class="chat-header">
          <div class="bot-badge">
            <span class="material-icons bot-icon">smart_toy</span>
            <div>
              <h2>SkyFlow AI Guide</h2>
              <span class="online-indicator">● ONLINE</span>
            </div>
          </div>
        </header>

        <div class="messages-container">
          <div *ngFor="let msg of messages" class="message-row" [class.user-row]="msg.sender === 'user'">
            <div class="message-bubble" [class.user-bubble]="msg.sender === 'user'">
              <p>{{ msg.text }}</p>

              <!-- Embedded Flight Widget Preview -->
              <div *ngIf="msg.flightWidget" class="flight-widget">
                <div class="widget-header">
                  <span class="flight-no">✈ FLIGHT {{ msg.flightWidget.flightNumber }}</span>
                  <span class="badge badge-operational">{{ msg.flightWidget.status }}</span>
                </div>

                <div class="widget-route">
                  <div class="point">
                    <h3>{{ msg.flightWidget.origin }}</h3>
                    <span>{{ msg.flightWidget.originCity }}</span>
                  </div>

                  <div class="line-box">
                    <span>{{ msg.flightWidget.duration }}</span>
                    <div class="route-line"></div>
                  </div>

                  <div class="point">
                    <h3>{{ msg.flightWidget.destination }}</h3>
                    <span>{{ msg.flightWidget.destinationCity }}</span>
                  </div>
                </div>

                <div class="widget-meta">
                  <div>
                    <span class="label">Departure</span>
                    <strong>{{ msg.flightWidget.departureTime }}</strong>
                  </div>
                  <div>
                    <span class="label">Gate</span>
                    <strong>{{ msg.flightWidget.gate }}</strong>
                  </div>
                </div>

                <div class="widget-actions">
                  <button class="btn btn-outline btn-sm">View Full Itinerary</button>
                  <button class="btn btn-primary btn-sm">Change Seats</button>
                </div>
              </div>

              <span class="timestamp">{{ msg.timestamp }}</span>
            </div>
          </div>
        </div>

        <!-- Chat Input Bar -->
        <div class="input-bar">
          <input type="text" 
                 [(ngModel)]="userInput" 
                 (keyup.enter)="sendMessage()" 
                 placeholder="Ask about flights, baggage, upgrades..." />
          <button (click)="sendMessage()" class="send-btn">
            <span class="material-icons">send</span>
          </button>
        </div>
        <p class="ai-disclaimer">SkyFlow AI Guide can make mistakes. Consider verifying important information.</p>
      </main>
    </div>
  `,
  styles: [`
    .assistant-page {
      display: grid;
      grid-template-columns: 280px 1fr;
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

      h3 { font-size: 1.3rem; margin-bottom: 8px; }
    }
    .topic-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .group-title {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--text-dim);
      letter-spacing: 0.05em;
    }
    .topic-btn, .recent-chat {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #111a30;
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
      .icon { font-size: 18px; color: var(--accent-color); }
    }
    .chat-card {
      background: var(--surface-bg);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .chat-header {
      padding: 20px 28px;
      border-bottom: 1px solid var(--border-color);
      background: #111a30;
    }
    .bot-badge {
      display: flex;
      align-items: center;
      gap: 14px;

      h2 { font-size: 1.2rem; margin: 0; }
    }
    .bot-icon {
      font-size: 32px;
      color: var(--accent-color);
      background: rgba(0, 220, 130, 0.1);
      padding: 8px;
      border-radius: 12px;
    }
    .online-indicator {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--accent-color);
    }
    .messages-container {
      flex: 1;
      padding: 28px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .message-row {
      display: flex;

      &.user-row {
        justify-content: flex-end;
      }
    }
    .message-bubble {
      background: #1c2847;
      padding: 16px 20px;
      border-radius: 16px;
      max-width: 600px;
      font-size: 0.95rem;
      line-height: 1.5;
      position: relative;

      &.user-bubble {
        background: var(--accent-color);
        color: #0b1329;
        font-weight: 600;
      }
    }
    .timestamp {
      display: block;
      font-size: 0.7rem;
      margin-top: 8px;
      opacity: 0.7;
    }
    .flight-widget {
      background: #0f172a;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px;
      margin-top: 14px;
    }
    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      font-weight: 700;
    }
    .widget-route {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      text-align: center;

      h3 { font-size: 1.4rem; font-weight: 800; }
      span { font-size: 0.8rem; color: var(--text-muted); }
    }
    .line-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 120px;
      span { font-size: 0.75rem; font-weight: 700; color: var(--accent-color); }
    }
    .route-line {
      width: 100%;
      height: 2px;
      background: var(--border-color);
      margin-top: 4px;
    }
    .widget-meta {
      display: flex;
      justify-content: space-between;
      background: #18223c;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 0.85rem;

      .label { display: block; font-size: 0.75rem; color: var(--text-muted); }
    }
    .widget-actions {
      display: flex;
      gap: 12px;
    }
    .input-bar {
      display: flex;
      padding: 16px 28px;
      gap: 12px;
      background: #111a30;
      border-top: 1px solid var(--border-color);

      input {
        flex: 1;
        padding: 14px 20px;
        background: #0b1329;
        border: 1px solid var(--border-color);
        border-radius: 24px;
        color: white;

        &:focus { outline: none; border-color: var(--accent-color); }
      }
    }
    .send-btn {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--accent-color);
      color: #0b1329;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover { background: var(--accent-hover); }
    }
    .ai-disclaimer {
      font-size: 0.75rem;
      color: var(--text-dim);
      text-align: center;
      padding: 8px 0 16px;
    }
  `]
})
export class AiAssistantComponent {
  userInput = '';

  messages: ChatMessage[] = [
    {
      id: 1,
      sender: 'user',
      text: 'Hi, I need to check the details for my upcoming flight to London next week.',
      timestamp: 'Today, 10:42 AM'
    },
    {
      id: 2,
      sender: 'ai',
      text: "Hello! I'd be happy to help you with that. I've located your booking for London Heathrow (LHR). Here are the details for your outbound flight:",
      timestamp: 'Today, 10:42 AM',
      flightWidget: {
        flightNumber: 'SF-492',
        origin: 'JFK',
        originCity: 'New York',
        destination: 'LHR',
        destinationCity: 'London',
        duration: '7h 15m',
        departureTime: 'Oct 24, 8:30 PM',
        gate: 'T4 - G12',
        status: 'On Time'
      }
    }
  ];

  sendMessage() {
    if (!this.userInput.trim()) return;

    const userText = this.userInput;
    this.messages.push({
      id: this.messages.length + 1,
      sender: 'user',
      text: userText,
      timestamp: 'Just now'
    });
    this.userInput = '';

    setTimeout(() => {
      this.messages.push({
        id: this.messages.length + 1,
        sender: 'ai',
        text: `I have checked the system for: "${userText}". All scheduled flights are currently operating normally with on-time performance at 94.8%. Let me know if you want me to update seat preferences or baggage baggage options!`,
        timestamp: 'Just now'
      });
    }, 600);
  }

  sendPreset(text: string) {
    this.userInput = text;
    this.sendMessage();
  }
}
