import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChapterManagementPage } from './ChapterManagementPage';
import * as chapterUtils from '../utils/chapterUtils';
import * as sectionUtils from '../utils/sectionUtils';

// Mock dependencies
vi.mock('../utils/chapterUtils', () => ({
  useChaptersCollection: vi.fn(),
  createChapter: vi.fn(),
  updateChapter: vi.fn(),
  deleteChapter: vi.fn(),
  toggleChapterStatus: vi.fn(),
}));

vi.mock('../utils/sectionUtils', () => ({
  fetchSectionsByChapter: vi.fn(),
  createSection: vi.fn(),
  deleteSection: vi.fn(),
  toggleSectionStatus: vi.fn(),
  normalizeSection: vi.fn(s => s),
}));

describe('ChapterManagementPage Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and displays mocked chapters', async () => {
    // 1. Mock empty/loading state initially or mock populated data
    chapterUtils.useChaptersCollection.mockReturnValue({
      rows: [
        { id: 1, apiId: 1, title: 'Chapter 1', summary: 'Intro', sections: 1, status: 'Published' },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<ChapterManagementPage />);

    // Check if chapter title is rendered
    expect(screen.getByText('Chapter 1')).toBeTruthy();
    expect(screen.getByText('Intro • 1 sections')).toBeTruthy();
  });

  it('handles expanding chapter to view sections with nested contents', async () => {
    chapterUtils.useChaptersCollection.mockReturnValue({
      rows: [{ id: 1, apiId: 1, title: 'Chapter 1', summary: 'Intro', sections: 1, status: 'Published' }],
      isLoading: false,
    });

    // Mock the section fetch response to return our new Attached Contents structure
    sectionUtils.fetchSectionsByChapter.mockResolvedValue([
      {
        id: 10,
        title: 'Section A - What is Presence?',
        status: 'Published',
        type: 'Text', // keeping old types for stability just in case
        contents: [
          { id: 101, title: 'Understanding the Basics', type: 'Text', is_required: true },
          { id: 102, title: 'Audio Guided Meditation', type: 'Audio', is_required: false },
        ]
      }
    ]);

    render(<ChapterManagementPage />);

    // Click "View Sections"
    const viewBtn = screen.getByRole('button', { name: /View Sections/i });
    fireEvent.click(viewBtn);

    // Wait for sections to load
    await waitFor(() => {
      expect(screen.getByText('Section A - What is Presence?')).toBeTruthy();
    });

    // Verify Attached Contents are rendered
    expect(screen.getByText(/Attached Content \(2\)/i)).toBeTruthy();
    
    // Verify first content
    expect(screen.getByText(/Understanding the Basics/i)).toBeTruthy();
    // Verify second content
    expect(screen.getByText(/Audio Guided Meditation/i)).toBeTruthy();
  });
  
  it('handles sections without attached contents properly', async () => {
    chapterUtils.useChaptersCollection.mockReturnValue({
      rows: [{ id: 1, title: 'Chapter 2', summary: 'Intro 2', sections: 1, status: 'Published' }],
      isLoading: false,
    });

    sectionUtils.fetchSectionsByChapter.mockResolvedValue([
      {
        id: 20,
        title: 'Empty Section',
        status: 'Drafted',
        contents: [] // Test condition for empty content
      }
    ]);

    render(<ChapterManagementPage />);

    fireEvent.click(screen.getByRole('button', { name: /View Sections/i }));

    await waitFor(() => {
      expect(screen.getByText('Empty Section')).toBeTruthy();
    });

    // Should not render "Attached Content" wrapper at all
    const attachedHeader = screen.queryByText(/Attached Content/i);
    expect(attachedHeader).toBeNull();
  });
});
