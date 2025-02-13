import { Component, HostListener, Renderer2, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PcConstellationComponent } from './pc-constellation/pc-constellation.component';
import { LockConstellationComponent } from './lock-constellation/lock-constellation.component';
import { FuseeConstellationComponent } from './fusee-constellation/fusee-constellation.component';
import { StatComponent } from './stat/stat.component';
import { DataServiceService } from '../data-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StarInfoComponent } from './star-info/star-info.component';

@Component({
  selector: 'app-constellation-container',
  standalone: true,
  imports: [CommonModule, PcConstellationComponent,LockConstellationComponent,FuseeConstellationComponent,StatComponent,StarInfoComponent],
  templateUrl: './constellation-container.component.html',
  styleUrls: ['./constellation-container.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConstellationContainerComponent {

  idComp: string = '';
  tooltipContent = {
    Competence : {
      title: "Empty"
    }
  };
  data: any;
  activities: any;
  soundsEnabled: any;
  warpSound: any;
  idApprenant: string = "";
  activitiesTitles: any[] = [
    [
      "Développer des interfaces utilisateur",
      "Développer des composants métier",
      "Installer et configurer son environnement de travail en fonction du projet",
      "Contribuer à la gestion d’un projet informatique",
    ],
    [
      "Développer des composants d’accès aux données SQL et NoSQL",
      "Concevoir et mettre en place une base de données relationnelle",
      "Analyser les besoins et maquetter une application",
      "Définir l’architecture logicielle d’une application",
    ],
    [
      "Préparer et exécuter les plans de tests d’une application",
      "Préparer et documenter le déploiement d’une application",
      "Contribuer à la mise en production dans une démarche DevOps",
    ],
  ];
  activitiesProgress: any[] = [
    0,
    0,
    0,
  ];
  activitiesPercent: any[] = [
    0,
    0,
    0,
  ];
  
  constructor(private router: Router, private dataService:DataServiceService, private route: ActivatedRoute,private renderer: Renderer2, )
  {
    this.warpSound = document.createElement('audio');
    this.warpSound.setAttribute('src', "../../assets/sounds/warp.mp3");
    this.warpSound.setAttribute('preload', "auto");
    this.soundsEnabled = document.querySelector(".mute-volume");
    this.route.params.subscribe( parms=> this.idApprenant = parms["id"]);
  }

  async ngOnInit(): Promise<void> {
    this.data="";
    try {
      this.data = await this.dataService.getCompentenceByIdApprenant(this.idApprenant);
      this.activities = await this.dataService.getAllActivite();
    } catch (e) {
      console.error('error', e);
    }
    console.log(this.data);

    this.data.forEach((row: any, index: number) => {
      // console.log("row= ", index, row['Competence']['title'], row['niveau']);  
      if (this.activitiesTitles[0].includes(row['Competence']['title']))
        {
          this.activitiesProgress[0] += +row['niveau'];
        } else if (this.activitiesTitles[1].includes(row['Competence']['title']))
          {
            this.activitiesProgress[1] += +row['niveau'];
          } else {
              this.activitiesProgress[2] += +row['niveau'];
          }
    });
    // console.log("progress= ",this.activitiesProgress);

    setTimeout(() => {
      this.calcProgressPercentByActivity();
    }, 500);

  }

  calcProgressPercentByActivity()
  {
    
    for (let i = 0, j = 12; i < 3; i++)
      {
        if (i === 2) j = 9;

        const progressBarLoader = document.querySelector(`.pb-activity-${i}`);
        const progressBarPercent = document.querySelector(`.pb-percent-activity-${i}`);
        
        if (progressBarLoader && progressBarPercent && this.activitiesProgress[i] > 0)
          {
            this.activitiesPercent[i] = Math.floor(100 / j * this.activitiesProgress[i]);
            progressBarLoader.setAttribute("style", `--i: ${this.activitiesPercent[i]}%`);
            this.updateProgressBarPercent(progressBarPercent, this.activitiesPercent[i]);
          }

      }

      // console.log("percent", this.activitiesPercent);
  }

  updateProgressBarPercent(target: Element, value: number)
  {
    target.textContent = "0%";
    let displayedValue = 0;

    setTimeout(() => {
      
      const updateText = setInterval(() => {
        displayedValue++;
        if (displayedValue === value)
          {
            clearInterval(updateText);
          }
        target.textContent = `${displayedValue}%`;
      }, 200 / value);

    }, 2500);

    
    // target.textContent = `${value}%`;
  }

  @HostListener('window:click', ['$event']) onMouseClick(e: any)
  {
    switch (e.target.className)
    {
      case "back-button":

        const backBtn = document.querySelector(".back-button");
        backBtn?.classList.add("back-button-clicked");
        
        const loadingScreen: any = document.querySelector(".container-loader");

        if (this.soundsEnabled.classList.contains("enable-sounds"))
          {
            setTimeout(() => {
              this.warpSound.play();
            }, 1000);
          }

        loadingScreen.classList.toggle("loader-visible");
        setTimeout(() => {
          loadingScreen.classList.toggle("loader-visible");
        }, 2000);

        setTimeout(() => {
          this.router.navigate([`/`]);
        }, 2000);

      break;

      default:

      break;
    }
  }

  public showStar({string,event} :any): void{
    console.log('id parent',string);
    const tooltip = document.querySelector('app-star-info');
    if (tooltip) {
      console.log(event);
      
      this.renderer.setStyle(tooltip, 'display', 'block');
      this.renderer.setStyle(tooltip, 'position', 'absolute');
      if(event.clientX < 1700 && event.clientY < 370)
        {
          this.renderer.setStyle(tooltip, 'left', event.clientX + 20 + 'px');
          this.renderer.setStyle(tooltip, 'top', event.clientY + 'px');
        }
        else if (event.clientX > 1700){
          this.renderer.setStyle(tooltip, 'left', event.clientX - 320 + 'px');
          this.renderer.setStyle(tooltip, 'top', event.clientY + 'px');
        } else if (event.clientY > 370 ){
          this.renderer.setStyle(tooltip, 'left', event.clientX + 20 + 'px');
          this.renderer.setStyle(tooltip, 'top', event.clientY + -80 +'px');
        }

      
      const row = this.data.find((e :any) => e.Competence.id == string)
      console.log('row in const',row);
      
      if (row) {
        this.tooltipContent = row
        console.log('tooltipContent',this.tooltipContent);
        
      }
  }
}

  public hideStar(leaveStar: boolean){
    const tooltip = document.querySelector('app-star-info');
    if (tooltip) {
      this.renderer.setStyle(tooltip, 'display', 'none');
      console.log('goodbye');
    }
    
  }
}