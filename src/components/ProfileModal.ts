import '../styles/profile.css';
import type { HideoutModule } from '../types/HideoutModule';
import type { Quest } from '../types/Quest';
import type { UserProgress } from '../types/UserProgress';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, translationEngine, type SupportedLanguage } from '../utils/translationEngine';
import { DEFAULT_USER_PROGRESS } from '../types/UserProgress';

export interface ProfileModalConfig {
  hideoutModules: HideoutModule[];
  quests: Quest[];
  userProgress: UserProgress;
  currentLanguage: SupportedLanguage;
  onSave: (progress: UserProgress) => void;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export class ProfileModal {
  private config: ProfileModalConfig;
  private workingProgress: UserProgress;
  private workingLanguage: SupportedLanguage;

  constructor(config: ProfileModalConfig) {
    this.config = config;
    this.workingProgress = this.cloneProgress(config.userProgress);
    this.workingLanguage = config.currentLanguage;
  }

  /**
   * Open the modal.
   */
  show(): void {
    this.workingProgress = this.cloneProgress(this.config.userProgress);
    this.workingLanguage = this.config.currentLanguage;
    const modal = document.getElementById('profile-modal');
    const content = modal?.querySelector('.modal-content');
    if (!modal || !content) return;

    content.innerHTML = this.render();
    modal.classList.add('active');
    this.attachEvents(modal);
  }

  /**
   * Update modal state when app progress changes externally.
   */
  updateState(progress: UserProgress, hideoutModules: HideoutModule[], quests: Quest[], currentLanguage: SupportedLanguage): void {
    this.config.hideoutModules = hideoutModules;
    this.config.quests = quests;
    this.config.userProgress = this.cloneProgress(progress);
    this.workingProgress = this.cloneProgress(progress);
    this.config.currentLanguage = currentLanguage;
    this.workingLanguage = currentLanguage;
  }

  private attachEvents(modal: HTMLElement): void {
    const overlay = modal.querySelector('.modal-overlay');
    const closeBtn = modal.querySelector('[data-action="close"]');
    const saveBtn = modal.querySelector('[data-action="save"]');
    const resetBtn = modal.querySelector('[data-action="reset"]');
    const langSelect = modal.querySelector<HTMLSelectElement>('[data-profile-lang]');

    overlay?.addEventListener('click', () => this.hide());
    closeBtn?.addEventListener('click', () => this.hide());
    resetBtn?.addEventListener('click', () => this.resetProgress());
    saveBtn?.addEventListener('click', () => this.saveAndClose());

    // Hideout sliders
    const sliders = modal.querySelectorAll<HTMLInputElement>('[data-module-id]');
    sliders.forEach(slider => {
      slider.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const moduleId = target.dataset.moduleId!;
        const level = parseInt(target.value, 10);
        this.workingProgress.hideoutLevels[moduleId] = level;
        const label = modal.querySelector<HTMLSpanElement>(`[data-module-label="${moduleId}"]`);
        if (label) {
          label.textContent = this.formatModuleLevel(moduleId, level);
        }
      });
    });

    // Quest checkboxes
    const questToggles = modal.querySelectorAll<HTMLInputElement>('[data-quest-id]');
    questToggles.forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        const questId = target.dataset.questId!;
        if (target.checked) {
          if (!this.workingProgress.completedQuests.includes(questId)) {
            this.workingProgress.completedQuests.push(questId);
          }
        } else {
          this.workingProgress.completedQuests = this.workingProgress.completedQuests.filter(id => id !== questId);
        }
      });
    });

    langSelect?.addEventListener('change', (e) => {
      const lang = (e.target as HTMLSelectElement).value as SupportedLanguage;
      if (SUPPORTED_LANGUAGES.includes(lang) && lang !== this.workingLanguage) {
        this.workingLanguage = lang;
        this.config.onLanguageChange(lang);
        this.rerender();
      }
    });

    // Collapsibles
    const toggles = modal.querySelectorAll<HTMLElement>('[data-collapse-toggle]');
    toggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const section = toggle.closest<HTMLElement>('[data-collapse]');
        const indicator = toggle.querySelector<HTMLElement>('.collapse-indicator');
        if (!section) return;
        const collapsed = section.classList.toggle('collapsed');
        if (indicator) {
          indicator.textContent = collapsed ? '▸' : '▾';
        }
      });
    });
  }

  private saveAndClose(): void {
    this.workingProgress.lastUpdated = Date.now();
    this.config.onSave(this.cloneProgress(this.workingProgress));
    this.hide();
  }

  private hide(): void {
    const modal = document.getElementById('profile-modal');
    modal?.classList.remove('active');
  }

  private resetProgress(): void {
    this.workingProgress = this.cloneProgress(DEFAULT_USER_PROGRESS);
    this.saveAndClose();
  }

  private render(): string {
    const lang = translationEngine.getCurrentLanguage() || DEFAULT_LANGUAGE;
    const moduleCards = this.config.hideoutModules
      .filter(module => module.id !== 'stash' && module.id !== 'workbench')
      .map(module => {
        const currentLevel = this.workingProgress.hideoutLevels[module.id] ?? 0;
        const moduleName = module.name[lang] || module.name[DEFAULT_LANGUAGE] || module.id;
        const levelText = this.formatModuleLevel(module.id, currentLevel);

        return `
          <div class="profile-module-card">
            <div class="profile-module-card__header">
              <h4>${moduleName}</h4>
              <span class="profile-module-card__level" data-module-label="${module.id}">${levelText}</span>
            </div>
            <input type="range" min="0" max="${module.maxLevel}" value="${currentLevel}" data-module-id="${module.id}" />
          </div>
        `;
      })
      .join('');

    const questItems = this.config.quests.sort((a, b) => {
      const nameA = a.name?.[lang] || a.name?.[DEFAULT_LANGUAGE] || a.id;
      const nameB = b.name?.[lang] || b.name?.[DEFAULT_LANGUAGE] || b.id;
      return nameA.localeCompare(nameB);
    })
      .map(quest => {
        const questName = quest.name?.[lang] || quest.name?.[DEFAULT_LANGUAGE] || quest.id;
        const checked = this.workingProgress.completedQuests.includes(quest.id) ? 'checked' : '';
        return `
          <label class="profile-quest">
            <input type="checkbox" data-quest-id="${quest.id}" ${checked} />
            <span>${questName}</span>
          </label>
        `;
      })
      .join('');

    return `
      <div class="profile-modal">
        <div class="profile-modal__header">
          <div class="profile-modal__eyebrow">
            ${translationEngine.get(`profile.title`)}
          </div>
        </div>
        <div class="profile-modal__body">
          <section class="profile-section" data-collapse>
            <div class="profile-modal__section-heading" data-collapse-toggle>
              <div class="profile-modal__eyebrow">
                ${translationEngine.get(`profile.display.title`)}
              </div>
              <p class="profile-modal__hint">${translationEngine.get(`profile.display.description`)}</p>
              <span class="collapse-indicator">▸</span>
            </div>
            <div class="profile-section__content" data-collapse-content>
              <div class="profile-field">
                <span class="profile-label">${translationEngine.get(`profile.display.select-lang`)}</span>
                <select class="lang-select profile-lang-select" data-profile-lang>
                  ${SUPPORTED_LANGUAGES.map(l => `<option value="${l}" ${l === this.workingLanguage ? 'selected' : ''}>${l.toUpperCase()}</option>`).join('')}
                </select>
              </div>
            </div>
          </section>
          <section class="profile-section" data-collapse>
            <div class="profile-modal__section-heading" data-collapse-toggle>
              <div class="profile-modal__eyebrow">
                ${translationEngine.get(`profile.hideout.title`)}
              </div>
              <p class="profile-modal__hint">${translationEngine.get(`profile.hideout.description`)}</p>
              <span class="collapse-indicator">▸</span>
            </div>
            <div class="profile-section__content" data-collapse-content>
              <div class="profile-modules-grid">
                ${moduleCards}
              </div>
            </div>
          </section>

          <section class="profile-section" data-collapse>
            <div class="profile-modal__section-heading" data-collapse-toggle>
              <div>
                <p class="profile-modal__eyebrow">${translationEngine.get(`profile.quests.title`)}</p>
              </div>
              <p class="profile-modal__hint">${translationEngine.get(`profile.quests.description`)}</p>
              <span class="collapse-indicator">▸</span>
            </div>
            <div class="profile-section__content" data-collapse-content>
              <div class="profile-quests-list">
                ${questItems}
              </div>
            </div>
          </section>
        </div>
        <div class="profile-modal__footer">
          <button class="btn btn-secondary" data-action="reset">${translationEngine.get('profile.reset')}</button>
          <div class="profile-modal__actions">
            <button class="btn btn-ghost" data-action="close">${translationEngine.get('profile.close')}</button>
            <button class="btn btn-primary" data-action="save">${translationEngine.get('profile.save')}</button>
          </div>
        </div>
      </div>
    `;
  }

  private formatModuleLevel(moduleId: string, level: number): string {
    const module = this.config.hideoutModules.find(m => m.id === moduleId);
    const max = module?.maxLevel ?? 0;
    if (level === 0) {
      return translationEngine.get('profile.controls.workshop.not_unlock');
    }
    return translationEngine.get('profile.controls.workshop.levels', [level.toString(), max.toString()]);
  }

  private cloneProgress(progress: UserProgress): UserProgress {
    return {
      hideoutLevels: { ...progress.hideoutLevels },
      completedQuests: [...progress.completedQuests],
      completedProjects: [...progress.completedProjects],
      lastUpdated: progress.lastUpdated
    };
  }

  private rerender(): void {
    const modal = document.getElementById('profile-modal');
    const content = modal?.querySelector('.modal-content');
    if (!modal || !content || !modal.classList.contains('active')) return;

    content.innerHTML = this.render();
    this.attachEvents(modal);
  }
}
