import { TestBed } from '@angular/core/testing';

import { LearningContentService } from './learning-content.service';

describe('LearningContentService', () => {
  let service: LearningContentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LearningContentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
