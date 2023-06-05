import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, Renderer2 } from '@angular/core';
import { MessageService, MenuItem } from 'primeng/api';
import { LearningContentService } from '../../service/learning-content.service';
import { TerminalService } from 'primeng/terminal';
import { Subscription } from 'rxjs';
import { jsPDF } from "jspdf";
interface AnswerResult {
  isCorrect: boolean;
  message: string;
}
@Component({
  selector: 'app-basic',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.css'],
  providers: [MessageService, TerminalService]
})
export class BasicComponent implements AfterViewInit, OnInit {
 fillups :any[] = [];

isCorrect: boolean = false;
  practicedata: any;

// checkAnswer(fillup: any) {
//   if (fillup.fillup_answer.toLowerCase() === fillup.pc_answer.toLowerCase()) {
//     fillup.message = 'Correct!';
//     this.isCorrect = true;
//   } else {
//     fillup.message = 'Incorrect. Please try again.';
//     this.isCorrect = false;
//   }
// }


currentTopic: any;
GetcontentData: any[] = [];
selectedData: any = this.GetcontentData[0];
availableData_new: any[]=[];
  moduleNo: any;
  fmodule: any;
  aa: any[] = [];
  bb: number = 0;
practicecode() {
  this.practice = true;
  }
  yes() {
    this.showquiz = true;
    // this.understandornot = false;
    this.visible2 = true;
    this.showTimer = true;
    this.startTimer();



  }

  allQuestionsAnswered: boolean = false;
  subscription!: Subscription;
  availableData: any = [];
  Currindex = 0;
  visible!: boolean;
  compiler!:boolean;
  visiblee!: boolean;
  maincontent!: boolean;
  visible1!: boolean;
  visible2!: boolean;
  quizended!: boolean;
  position2!: string;
  position3!: string;
  positionquiz!: string;
  visible3!: boolean;
  position4!:string;
  practice!:boolean;
  quizSubmitted = false;
  clickedIndexes: boolean[] = [];
  position!: string;
  positionn!: string;
  position1!: string;
  title: string = "";
  value: string = "";
  itemss: any = [];
  understandornot: boolean = false;
  showquiz: boolean = false;
  timerValue: number = 1000; // 60 seconds
  showTimer: boolean = false;
  timeTaken: number = 0;

  quizendeddialog() {
    this.quizended = true;
    this.visible2 = false;
  }
  endquiz() {
    this.quizended = false;
  }

  quizData: any[] = [];
  overallPercentage: any;
  datanotes: any;
  videoEnded!: boolean;
  // deleteItem(item: any) {
  //   const index = this.itemss.indexOf(item);
  //   if (index > -1) {
  //     this.itemss.splice(index, 1);
  //   }
  // }
  notesdata: any = {
    title: '',
    value: ''
  }

  onSubmit() {

    this.notesdata = {
      title: this.notesdata.title,
      value: this.notesdata.value
    }

    if (this.notesdata) {
      this.service.notesdata(this.notesdata).subscribe((res: any) => {
        console.log("Data sent successfully")
      });
    }
    this.title = '';
    this.value = '';
  }
  getnotesdata() {
    this.service.getnotesdata().subscribe((response: any) => {
      this.datanotes = response.data
    })
  }
  getpracticedata() {
    this.service.getpracticedata().subscribe((response: any) => {
      this.fillups = response.data;
    console.log(this.fillups);

    })
    
  }
  constructor(private service: LearningContentService, private terminalService: TerminalService) {
    this.terminalService.commandHandler.subscribe(command => {
      let response;
      switch (command) {
        case 'date':
          response = new Date().toDateString();
          break;
        case 'git config':
          response = 'git config -global user.name “[name]” - This command sets the author name and email address respectively to be used with your commits.';
          break;
        case 'git init':
          response = 'git init [repository name] - This command is used to start a new repository.';
          break;
        case 'git clone':
          response = 'git clone [url]  -  This command is used to obtain a repository from an existing URL.';
          break;
        case 'git add':
          response = 'git add [file] - This command adds a file to the staging area.';
          break;
        case 'git commit':
          response = 'git commit -m “[ Type in the commit message]” - This command records or snapshots the file permanently in the version history.';
          break;
        case 'git log':
          response = 'git log - This command is used to list the version history for the current branch.';
          break;
        case 'git merge':
          response = 'git merge [branch name] - This command merges the specified branch’s history into the current branch.';
          break;
        case 'git checkout':
          response = '(git checkout [branch name] - This command is used to switch from one branch to another)   (git checkout -b [branch name] - This command creates a new branch and also switches to it.)';
          break;
        case 'git push':
          response = 'git push [variable name] [branch] - This command sends the branch commits to your remote repository.';
          break;
        case 'git pull':
          response = 'git pull [Repository Link]  -This command fetches and merges changes on the remote server to your working directory.';
          break;
        case 'git stash':
          response = '(git stash save - This command temporarily stores all the modified tracked files.), (git stash pop - This command restores the most recently stashed files.), (git stash list -This command lists all stashed changesets.), (git stash drop - This command discards the most recently stashed changeset.)';
          break;
        default:
          response = 'Please Enter a Valid Command: ';
      }
      this.terminalService.sendResponse(response);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  @ViewChild('myVideo') videoElementRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('myVideo') myVideo!: ElementRef;
  @ViewChild('questionsContainer') questionsContainer!: ElementRef;

  items!: MenuItem[];
  downloadPdf() {
    const doc = new jsPDF();
    const notes = document.createElement('div'); // create a new div element

    // loop through datanotes and add each item to the new div element
    this.datanotes.forEach((item: { title: string; content: string; }, i: number) => {
      const itemDiv = document.createElement('div');
      const index = document.createElement('p');
      const title = document.createElement('div');
      const value = document.createElement('p');

      index.innerText = `${i + 1}.`;
      title.innerText = item.title;
      value.innerText = item.content;

      // reduce font size of title and value elements
      title.style.fontSize = '7px';
      index.style.fontSize = '5px';
      title.style.fontWeight = 'bold';
      value.style.fontSize = '5px';

      itemDiv.appendChild(index);
      itemDiv.appendChild(title);
      itemDiv.appendChild(value);
      notes.appendChild(itemDiv);
    });

    doc.html(notes, {
      callback: function (doc) {
        doc.save('notes.pdf');
      },
      x: 10,
      y: 10
    });
  }






  ngOnInit() {
    this.dialogTimeTaken = 0;
    this.getdata()
    this.getquizdata()
    this.getnotesdata()
    this.getpracticedata()
    this.items = [
      {
        icon: 'pi pi-arrow-circle-left',
        command: () => {
        }
      },
      {
        tooltipOptions: {
          tooltipLabel: 'Download material',
          tooltipPosition: 'left'
        },
        icon: 'pi pi-arrow-circle-down',
        command: () => {
          this.showDialogg('center')
        },
        title: 'Download notes'
      },

      {
        tooltipOptions: {
          tooltipLabel: 'Learn Commands',
          tooltipPosition: 'left'
        },
        icon: 'pi pi-slack',
        command: () => {
          this.showDialog1('center')
        },
        title: 'Learn commands'
      },
      {
        tooltipOptions: {
          tooltipLabel: 'Notes',
          tooltipPosition: 'left'
        },
        icon: 'pi pi-book',
        command: () => {
          this.showDialog('right')
        },
        title: 'Notes'

      }
    ];

  }
  refreshPage() {
    location.reload();
  }
  ngAfterViewInit() {

    setTimeout(() => {
      const videoElement = this.videoElementRef?.nativeElement;
      videoElement.addEventListener('play', () => {
        console.log('The video has started playing!');


      });
      const speedDialElement = document.querySelector('#speedDial_Circle');
      speedDialElement!.addEventListener('click', () => {
        console.log('The video has been paused');
        videoElement.pause();
      });

      videoElement.addEventListener('ended', () => {
        console.log('The video has ended!');

      });

    });
  }
  showNextBtn = true;
  showPrevBtn = false;

  showNextContent(index: number) {
    // const nextModuleNo = this.availableData[index]?.module_no + 1;
    // const nextModuleFillups = this.fillups.filter(f => f.module_no === nextModuleNo);
    // if (nextModuleFillups.length > 0) {
    //   this.currentFillupIndex = this.fillups.findIndex(f => f.id === nextModuleFillups[0].id);
    // }
    this.currentFillupIndex = 0;

    const nextIndex = this.Currindex + 1;
    if (nextIndex < this.GetcontentData.length) {
      const nextData = this.GetcontentData[nextIndex];
      this.availableData[index] = nextData; // replace the current data with the next data
      this.Currindex = nextIndex;
      this.clickedIndexes[index] = true;
      const videoPlayer: HTMLVideoElement = this.myVideo.nativeElement;
      videoPlayer.pause();
    }

    if (nextIndex < this.GetcontentData.length - 1) {
      // Show both next and previous buttons
      this.showNextBtn = true;
      this.showPrevBtn = true;
    } else if (nextIndex === this.GetcontentData.length - 1) {
      // Show only the previous button in the last index
      this.showNextBtn = false;
      this.showPrevBtn = false;
      this.understandornot = true;
      // this.renderer.selectRootElement(this.questionsContainer.nativeElement).focus();


    } else if (nextIndex === 1) {
      // Show only the next button when moving to the first content from the second content
      this.showNextBtn = true;
      this.showPrevBtn = false;
    }
  }



  showPrevContent(index: number) {
    const prevIndex = this.Currindex - 1;
    if (prevIndex >= 0) {
      const prevData = this.GetcontentData[prevIndex];
      this.availableData[index] = prevData;
      this.Currindex = prevIndex;
      this.clickedIndexes[index] = true;
      const videoPlayer: HTMLVideoElement = this.myVideo.nativeElement;
      videoPlayer.pause();
    }
    if (prevIndex === 0) {
      // Show only the next button when moving to the first content from the second content
      this.showNextBtn = true;
      this.showPrevBtn = false;
    } else {
      // Show both next and previous buttons
      this.showNextBtn = true;
      this.showPrevBtn = true;
    }
  }


  showContent(data: any) {
    this.selectedData = data;
    if(!this.understandornot){
      this.Currindex = this.GetcontentData.findIndex((item: { course_name: any; }) => item.course_name === data.course_name);
      this.showNextBtn = this.Currindex < this.GetcontentData.length - 1;
      this.showPrevBtn = this.Currindex > 0;
    }
  }
  
  getdata(): void {
    this.service.getcontentdata().subscribe((response: any) => {
      this.GetcontentData = response.data;
      console.log(this.GetcontentData, "this.GetData");
      this.availableData.push(this.GetcontentData[this.Currindex]);
      
    });
  }
  getquizdata(): void {
    this.service.getquizdata().subscribe((response: any) => {
      this.quizData = response.data;
      console.log(this.quizData, "this.GetData");
  
      // shuffle the quizData array
      this.quizData = this.shuffleArray(this.quizData);
  
      // select 10 random arrays from the shuffled quizData array
      this.quizData = this.quizData.slice(0, 10);
  
      console.log(this.quizData, "this.RandomData");
    });
  }
  
  shuffleArray(array: any[]): any[] {
    // Fisher-Yates shuffle algorithm
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  

  showDialog(position: string) {
    this.position = position;
    this.visible = true;
  }
  showDialogg(positionn: string) {
    this.positionn = positionn;
    this.visiblee = true;

  }
  showDialog1(position1: string) {
    this.position1 = position1;
    this.visible1 = true;

  }
  dialogTimeTaken: number = 0;
  selectedAnswers: (number | undefined)[] = [];

  getAttendedAndTotalAnswers(): string {
    let totalAnswers = this.quizData.length;
    let attendedAnswers = 0;
    for (let i = 0; i < totalAnswers; i++) {
      if (this.selectedAnswers[i] !== undefined) {
        attendedAnswers++;
      }
    }
    return attendedAnswers + '/' + totalAnswers;
  }

  getAnswerResult(questionIndex: number): AnswerResult {
    const selectedAnswer = this.selectedAnswers[questionIndex];
    const correctAnswer = this.quizData[questionIndex].answer;
    const correctOptionIndex = parseInt(correctAnswer);
    const correctOption = this.quizData[questionIndex]['option' + (correctOptionIndex + 1)];
    const correctOptionMessage = `Sorry, the correct option is option ${correctOptionIndex + 1}: ${correctOption}.`;


    if (selectedAnswer === undefined) {
      return { message: 'Please select an answer.', isCorrect: false };
    } else if (selectedAnswer == correctAnswer) {
      return { message: 'Correct!', isCorrect: true };
    } else {
      return {
        message: correctOptionMessage,
        isCorrect: false
      };
    }

  }




  wrongAnswers: { questionIndex: number, selectedOptionIndex: number, correctOptionIndex: number }[] = [];

  onAnswerSelected(questionIndex: number, optionIndex: number) {
    // Code for storing the selected answer
    this.selectedAnswers[questionIndex] = optionIndex;
    this.checkAllQuestionsAnswered(); // Check if all questions are answered
    
    const selectedAnswer = this.selectedAnswers[questionIndex];
    const correctAnswer = this.quizData[questionIndex].answer;
    const correctOptionIndex = parseInt(correctAnswer);
    const correctOption = this.quizData[questionIndex]['option' + (correctOptionIndex + 1)];
    
    // Check if the selected answer is incorrect
    if (selectedAnswer !== correctOptionIndex) {
      const wrongAnswer = {
        questionIndex: questionIndex,
        selectedOptionIndex: optionIndex,
        correctOptionIndex: correctOptionIndex
      };
      this.wrongAnswers.push(wrongAnswer);
    }
  }
  
  
  allAnswersSelected() {
    for (let i = 0; i < this.quizData.length; i++) {
      if (this.selectedAnswers[i] === undefined) {
        return false;
      }
    }
    return true;
  }


  checkAllQuestionsAnswered() {
    this.allQuestionsAnswered = this.selectedAnswers.every(answer => answer !== undefined);
  }

   timerInterval : any; // define a variable to hold the timer interval

  startTimer() {
    this.timerInterval = setInterval(() => { // assign the timer interval to the variable
      if (this.timerValue > 0) {
        this.timerValue--;
        this.timeTaken++;
      } else {
        this.quizendeddialog();
        clearInterval(this.timerInterval); // stop the timer interval when time is up
      }
    }, 1000);
  }
  
  submitquiz() {
    this.visible2 = false;
    this.visible3 = true;
    this.dialogTimeTaken = this.timeTaken;
    this.quizended = false;
    clearInterval(this.timerInterval); // stop the timer interval when the quiz is submitted
  }
  

// compiler

  currentFillupIndex = 0;
  get currentFillup() {
    return this.availableData[this.currentFillupIndex];
  }
  split_answer : any[] =[];
  calculateInputWidth(checkd : any) {
    this.split_answer = checkd.pc_answer.split(',');
    const splitAnswer = this.split_answer[this.currentFillupIndex];
    return splitAnswer ? splitAnswer.length * 10 : null;
  }
  checkAnswer(fillup: any) {
    this.split_answer = fillup.pc_answer.split(',');
    console.log(this.split_answer);
    if (fillup.fillup_answer.toLowerCase() === this.split_answer[this.currentFillupIndex].toLowerCase()) {
      fillup.message = 'Correct!';
      this.isCorrect = true;
    } else {
      fillup.message = 'Incorrect. Please try again.';
      this.isCorrect = false;
    }
  }

  // previousFillup() {
  //   if (this.currentFillupIndex > 0) {
  //     this.currentFillupIndex--;
  //   }
  // }

  // nextFillup() {
  //   if (this.currentFillupIndex < this.fillups.length - 1) {
  //     this.currentFillupIndex++;
  //   }
  // }
  previousFillup(i: number) {
      this.currentFillupIndex--;
    // this.split_answer[this.currentFillupIndex] = '';
    this.availableData[i].fillup_answer = '';
    this.availableData[this.currentFillupIndex].message = '';

  }
  
  
  // nextFillup(index : any) {
  //   this.moduleNo = this.availableData[index].module_no;
    
  //   this.fmodule = this.fillups[index].module_no;
  //   console.log(this.fmodule,this.moduleNo);
    
  //   if(this.moduleNo === this.fmodule){
  //     this.currentFillupIndex++;
  //   }
  //   // console.log(this.fillups.findIndex((f: { module_no: any; }) => f.module_no),"this.fillups.findIndex((f: { module_no: any; }) => f.module_no");

  // }
  currentDataIndex: number = 0;
  showmodule = false;
  nextFillup(i:any) {
    this.availableData[i].message = '';
    this.availableData[i].fillup_answer = '';
    this.aa = this.availableData[i].sentence.split(",");
    this.bb = this.aa.length;
    // if(this.currentFillupIndex === (this.bb +1)){
    //   this.showmodule = true;

    // }
    console.log(this.aa,this.aa.length,"Hello");
    this.currentFillupIndex++;
    // this.split_answer[this.currentFillupIndex] = '';
  }  

}




// @ViewChild('myVideo') myVideo: ElementRef;
// availableData: any[] = [/* Your data */];
// currentData: any[] = [];
// currentPage = 1;
// pageSize = 5;
// hasNextPage = false;
// isVideoEnded = false;

// constructor() {
//   this.loadPage(this.currentPage);
// }

// loadPage(page: number) {
//   const startIndex = (page - 1) * this.pageSize;
//   const endIndex = startIndex + this.pageSize;
//   this.currentData = this.availableData.slice(startIndex, endIndex);
//   this.hasNextPage = endIndex < this.availableData.length;
//   this.isVideoEnded = false;
//   this.myVideo.nativeElement.currentTime = 0;
//   this.myVideo.nativeElement.play();
// }

// loadNextPage() {
//   this.currentPage++;
//   this.loadPage(this.currentPage);
// }

// onVideoEnded() {
//   this.isVideoEnded = true;
// }


