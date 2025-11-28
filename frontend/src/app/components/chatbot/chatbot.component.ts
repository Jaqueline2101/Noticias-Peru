import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService, NoticiaViewModel } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';

interface ChatMessage {
  text: string;
  isUser: boolean;
  articles?: NoticiaViewModel[];
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chatbot-container" *ngIf="isPremium">
      <!-- Chat Button -->
      <button class="chat-button" (click)="toggleChat()" *ngIf="!isOpen">
        <span class="icon">🤖</span>
        <span class="label">Asistente Noticias</span>
      </button>

      <!-- Chat Window -->
      <div class="chat-window" *ngIf="isOpen">
        <div class="chat-header">
          <div class="header-info">
            <span class="icon">🤖</span>
            <h3>Asistente IA</h3>
            <span class="badge-premium">Premium</span>
          </div>
          <button class="close-btn" (click)="toggleChat()">×</button>
        </div>

        <div class="chat-messages" #scrollContainer>
          <div class="message bot">
            <p>Hola, soy tu asistente de noticias. ¿Sobre qué tema te gustaría informarte hoy?</p>
          </div>

          <div *ngFor="let msg of messages" class="message" [ngClass]="{'user': msg.isUser, 'bot': !msg.isUser}">
            <p>{{ msg.text }}</p>
            
            <!-- Articles Preview -->
            <div *ngIf="msg.articles && msg.articles.length > 0" class="articles-preview">
              <div *ngFor="let article of msg.articles" class="mini-card">
                <img [src]="article.imagen_url" alt="Thumb">
                <div class="mini-content">
                  <h4>{{ article.titulo }}</h4>
                  <a [href]="'/noticia/' + article.id" target="_blank">Leer más</a>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="loading" class="message bot loading">
            <span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
          </div>
        </div>

        <div class="chat-input">
          <textarea 
            [(ngModel)]="userInput" 
            (keydown.enter)="onEnter($event)"
            placeholder="Pregunta sobre noticias..."
            [disabled]="loading"
            rows="1"
          ></textarea>
          <button (click)="sendMessage()" [disabled]="!userInput.trim() || loading">➤</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chatbot-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      font-family: 'Inter', sans-serif;
    }

    .chat-button {
      background: #cc0000;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 30px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 15px rgba(204, 0, 0, 0.3);
      transition: transform 0.2s;
    }

    .chat-button:hover {
      transform: scale(1.05);
    }

    .chat-button .icon { font-size: 1.5rem; }
    .chat-button .label { font-weight: 600; }

    .chat-window {
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 5px 25px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .chat-header {
      background: #cc0000;
      color: white;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .header-info h3 { margin: 0; font-size: 1rem; }
    
    .badge-premium {
      background: #ffd700;
      color: #cc0000;
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: bold;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
    }

    .chat-messages {
      flex: 1;
      padding: 15px;
      overflow-y: auto;
      background: #f9f9f9;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .message {
      max-width: 85%;
      padding: 10px 15px;
      border-radius: 10px;
      font-size: 0.9rem;
      line-height: 1.4;
      word-wrap: break-word;
    }

    .message.bot {
      background: white;
      align-self: flex-start;
      border-bottom-left-radius: 2px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .message.user {
      background: #cc0000;
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 2px;
    }

    .articles-preview {
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .mini-card {
      display: flex;
      gap: 10px;
      background: #f0f0f0;
      padding: 8px;
      border-radius: 6px;
      align-items: center;
    }

    .mini-card img {
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: 4px;
    }

    .mini-content h4 {
      margin: 0 0 4px 0;
      font-size: 0.8rem;
      color: #333;
    }

    .mini-content a {
      font-size: 0.75rem;
      color: #cc0000;
      text-decoration: none;
    }

    .chat-input {
      padding: 15px;
      background: white;
      border-top: 1px solid #eee;
      display: flex;
      gap: 10px;
      align-items: flex-end;
    }

    .chat-input textarea {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 15px;
      outline: none;
      resize: none;
      font-family: inherit;
      min-height: 40px;
      max-height: 100px;
    }

    .chat-input button {
      background: #cc0000;
      color: white;
      border: none;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2px;
    }

    .chat-input button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .loading .dot {
      animation: blink 1.4s infinite both;
    }
    .loading .dot:nth-child(2) { animation-delay: 0.2s; }
    .loading .dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes blink {
      0% { opacity: 0.2; }
      20% { opacity: 1; }
      100% { opacity: 0.2; }
    }
  `]
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  isOpen = false;
  userInput = '';
  messages: ChatMessage[] = [];
  loading = false;

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) { }

  ngOnInit() { }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  get isPremium(): boolean {
    return this.authService.isPremium();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  onEnter(event: any) {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.sendMessage();
    }
  }

  async sendMessage() {
    if (!this.userInput.trim()) return;

    const query = this.userInput;
    this.messages.push({ text: query, isUser: true });
    this.userInput = '';
    this.loading = true;

    try {
      // Buscar noticias relevantes
      const results = await this.supabaseService.searchNews(query);

      if (results.length > 0) {
        // Simular "Inteligencia": Usar el resumen de la noticia más relevante como respuesta
        const topNews = results[0];
        const aiResponse = `Según la información de ${topNews.medio}: ${topNews.bajada || topNews.titulo}. Aquí tienes más detalles y otras noticias relacionadas:`;

        this.messages.push({
          text: aiResponse,
          isUser: false,
          articles: results
        });
      } else {
        this.messages.push({
          text: `He buscado en toda nuestra base de datos pero no encontré información específica sobre "${query}" en las noticias recientes. ¿Te gustaría intentar con otro término?`,
          isUser: false
        });
      }
    } catch (error) {
      this.messages.push({
        text: 'Tuve un problema al buscar la información. Por favor intenta de nuevo.',
        isUser: false
      });
    } finally {
      this.loading = false;
    }
  }
}
