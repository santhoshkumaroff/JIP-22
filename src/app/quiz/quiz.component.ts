import { Component} from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { FormGroup } from '@angular/forms';



interface Question {
  question: string;
  options: string[];
  answer: number | null;
  coursecode :string;
}

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0
      })),
      transition('void <=> *', animate(300)),
    ]),
    trigger('highlight', [
      state('correct', style({
        background: 'green',
        color: '#fff'
      })),
      state('incorrect', style({
        background: 'red',
        color: '#fff'
      })),
      transition('void => correct', [
        style({ background: 'transparent', color: 'inherit' }),
        animate('0.5s ease-out')
      ]),
      transition('void => incorrect', [
        style({ background: 'transparent', color: 'inherit' }),
        animate('0.5s ease-out')
      ])
    ])
  ]
})
export class QuizComponent {

  // quizTitle: string = 'Practice Quiz';
  // questions: Question[] = [
  //   {
  //     question: 'What is the capital of France?',
  //     options: ['London', 'Paris', 'Berlin', 'Madrid'],
  //     answer: 1
  //   },
  //   {
  //     question: 'What is the tallest mountain in the world?',
  //     options: ['Mount Everest', 'K2', 'Kangchenjunga', 'Lhotse'],
  //     answer: 0
  //   },
  //   {
  //     question: 'What is the largest planet in our solar system?',
  //     options: ['Mars', 'Venus', 'Jupiter', 'Saturn'],
  //     answer: 2
  //   }
  // ];
  // selectedAnswers: number[] = [];
  // currentIndex: number = 0;
  // answered: boolean = false;
  // showAnswers: boolean = false;
  // showResults: boolean = false;

  // submitAnswer() {
  //   this.answered = true;
  //   const currentAnswer = this.selectedAnswers[this.currentIndex];
  //   const correctAnswer = this.questions[this.currentIndex].answer;
  //   if (currentAnswer === correctAnswer) {
  //     const congratsGif = document.createElement('img');
  //     congratsGif.src = 'https://example.com/congrats.gif'; // Replace with URL of the actual GIF
  //     document.body.appendChild(congratsGif);
  //   }
  // }
  
  // goToNextQuestion() {
  //   this.currentIndex++;
  //   this.answered = false;
  //   this.showAnswers = false;
  // }

  // isAnswerCorrect(index: number) {
  //   return this.selectedAnswers[index] === this.questions[index].answer;
  // }

  // isAnswerIncorrect(index: number) {
  //   return this.selectedAnswers[index] !== this.questions[index].answer && this.selectedAnswers[index] !== undefined;
  // }

  // getPercentage() {
  //   let correctAnswers = 0;
  //   for (let i = 0; i < this.questions.length; i++) {
  //     if (this.selectedAnswers[i] === this.questions[i].answer) {
  //       correctAnswers++;
  //     }
  //   }
  //   return correctAnswers;
  // }

  // restartQuiz() {
  //   this.selectedAnswers = [];
  //   this.currentIndex = 0;
  //   this.answered = false;
  //   this.showAnswers = false;
  //   this.showResults = false;
  // }

answer : string = ''
  questions: Question[] = [];
  newQuestion: Question = {
    question: '',
    options: ['', '', '', ''],
    answer: 0,
    coursecode: ''

  };
  
  onSubmit() {
    this.questions.push(this.newQuestion);
    this.newQuestion = {
      question: '',
      options: ['', '', '', ''],
      answer: 0,
      coursecode: ''
    };
    console.log(this.questions);

  }


  }

