import { Component, HostListener } from '@angular/core';
import { DataServiceService } from '../../data-service.service';
import { CommonModule, NgFor } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CanvasComponent } from 'src/app/canvas/canvas.component';

@Component({
  selector: 'app-homepage-character-list',
  standalone: true,
  imports: [CommonModule, NgFor, RouterModule, CanvasComponent],
  templateUrl: './homepage-character-list.component.html',
  styleUrls: ['./homepage-character-list.component.scss']
})


export class HomepageCharacterListComponent {
  chars: any;
  hoveredCharID: any;
  soundsEnabled: any;
  warpSound: any;

  constructor(private dataService: DataServiceService, private router: Router) {
    this.warpSound = document.createElement('audio');
    this.warpSound.setAttribute('src', "../../assets/sounds/warp.mp3");
    this.warpSound.setAttribute('preload', "auto");
    this.soundsEnabled = document.querySelector(".mute-volume");
  }

  async ngOnInit():Promise<void>
  {
      this.chars = await this.dataService.getAllApprenant();
  }

  addFocus()
  {
    const target = document.querySelector(`#character-${this.hoveredCharID}`);
    target?.classList.add("character-hover");
  }

  removeFocus()
  {
    const target = document.querySelector(`#character-${this.hoveredCharID}`);
    target?.classList.remove("character-hover");
    this.hoveredCharID = null;
  }

  @HostListener('window:mousemove', ['$event']) onMouseMove(e: any)
  {
    switch (e.target.className)
    {
      case "homepage-character-card-name":
        if (this.hoveredCharID !== null)
          {
            this.removeFocus();
          }
          const id = e.target.id;
          this.hoveredCharID = id.substring(15);
          this.addFocus();
      break;
      
      default:
        if (this.hoveredCharID !== null)
          {
            this.removeFocus();
          }
      break;
    }
  }

  @HostListener('window:click', ['$event']) onMouseClick(e: any)
  {
    switch (e.target.className)
    {
      case "homepage-character-card-name":
      case "character-content":

        let characterID: string = '';

        if (e.target.className === "homepage-character-card-name")
          {
            characterID = e.target.id.substring(15);
          } else if (e.target.className === "character-content") {
            characterID = e.target.id.substring(10);
          }
        const characterNameCard = document.querySelector(`#character-list-${characterID}`);
        characterNameCard?.classList.add("homepage-character-card-name-clicked");

        const target: any = document.querySelector(`#character-${characterID}`);
        const position = target.getBoundingClientRect();
        const x = Math.floor(position.top);
        const y = Math.floor(position.left);

        const galaxy: any = document.querySelector(".galaxy");
        galaxy.style.transform = `scale(4) translateZ(-100px)`;
        galaxy.style.transformOrigin = `${y / 2}px ${x / 2}px`;

        const characters: any = document.querySelectorAll(".character-content");

        characters.forEach((char: { id: string; style: { opacity: number; }; }) => {
          if (char !== target)
            {
              char.style.opacity = 0;
            }
        });
        
        const loadingScreen: any = document.querySelector(".homepage-loader");
        loadingScreen.classList.toggle("loader-visible");

        if (this.soundsEnabled.classList.contains("enable-sounds"))
          {
            setTimeout(() => {
              this.warpSound.play();
            }, 1000);
          }

        setTimeout(() => {
          loadingScreen.classList.toggle("loader-visible");
        }, 2000);

        setTimeout(() => {
          this.router.navigate([`/constellation/${characterID}`]);
        }, 2000);

      break;

      default:

      break;
    }
  }

}
