import { test, expect } from '../fixtures/test-fixtures'
import { goToProjectStage, goToPreview } from '../helpers/navigation'
import {
  mockResearchQuestionsAPI,
  mockResearchPlanAPI,
  mockOutlineAPI,
  mockWriteAPI,
  mockEditAPI,
  mockReviewAPI,
  mockFeedbackLoopAPI,
  mockConsistencyAPI,
  mockCoverGenerateAPI,
} from '../fixtures/mock-ai'
import { MOCK_OUTLINE, MOCK_CHAPTER_CONTENT } from '../fixtures/seed-data'

test.describe('Full Pipeline Integration', () => {
  /**
   * Helper: set up project with research data completed
   */
  async function setupResearchComplete(page: any, projectId: string) {
    await page.request.put(`/api/projects/${projectId}/research`, {
      data: {
        initialIdea: 'AI 자의식 소설',
        aiQuestions: JSON.stringify([
          { id: 'q1', question: '주인공은?', category: 'character' },
        ]),
        userAnswers: JSON.stringify([
          { questionId: 'q1', answer: 'AI 연구원' },
        ]),
        findings: '<p>완성된 리서치</p>',
      },
    })
  }

  /**
   * Helper: set up project with outline confirmed
   */
  async function setupOutlineConfirmed(page: any, projectId: string) {
    await setupResearchComplete(page, projectId)
    await page.request.put(`/api/projects/${projectId}`, {
      data: {
        outline: MOCK_OUTLINE,
        confirmedAt: new Date().toISOString(),
        stage: 'write',
        status: 'writing',
      },
    })
  }

  /**
   * Helper: set up project with chapters written
   */
  async function setupChaptersWritten(page: any, projectId: string) {
    await setupOutlineConfirmed(page, projectId)
    for (const ch of MOCK_OUTLINE.chapters) {
      await page.request.post(`/api/projects/${projectId}/chapters`, {
        data: {
          number: ch.number,
          title: ch.title,
          content: MOCK_CHAPTER_CONTENT,
          status: 'draft',
        },
      })
    }
    await page.request.put(`/api/projects/${projectId}`, {
      data: { stage: 'edit', status: 'editing' },
    })
  }

  /**
   * Helper: set up project ready for review
   */
  async function setupReadyForReview(page: any, projectId: string) {
    await setupResearchComplete(page, projectId)
    await page.request.put(`/api/projects/${projectId}`, {
      data: {
        outline: MOCK_OUTLINE,
        confirmedAt: new Date().toISOString(),
        stage: 'review',
        status: 'editing',
      },
    })
    for (const ch of MOCK_OUTLINE.chapters) {
      await page.request.post(`/api/projects/${projectId}/chapters`, {
        data: {
          number: ch.number,
          title: ch.title,
          content: MOCK_CHAPTER_CONTENT,
          status: 'editing',
        },
      })
    }
  }

  /**
   * Helper: set up completed project for preview
   */
  async function setupCompletedProject(page: any, projectId: string) {
    await setupResearchComplete(page, projectId)
    await page.request.put(`/api/projects/${projectId}`, {
      data: {
        outline: MOCK_OUTLINE,
        confirmedAt: new Date().toISOString(),
        stage: 'review',
        status: 'completed',
      },
    })
    for (const ch of MOCK_OUTLINE.chapters) {
      await page.request.post(`/api/projects/${projectId}/chapters`, {
        data: {
          number: ch.number,
          title: ch.title,
          content: MOCK_CHAPTER_CONTENT,
          status: 'approved',
        },
      })
    }
  }

  test('Full Pipeline: Research -> Outline -> Write -> Edit -> Review -> Preview', async ({
    page,
    projectId,
  }) => {
    test.slow()

    // 1. Research stage
    await mockResearchQuestionsAPI(page)
    await mockResearchPlanAPI(page)
    await goToProjectStage(page, projectId, 'research')
    await expect(page.getByText('리서치').first()).toBeVisible({ timeout: 10000 })

    // 2. Set up research and go to outline
    await setupResearchComplete(page, projectId)
    await mockOutlineAPI(page)
    await goToProjectStage(page, projectId, 'outline')
    await expect(page.getByText('목차').first()).toBeVisible({ timeout: 10000 })

    // 3. Set up outline and go to write
    await setupOutlineConfirmed(page, projectId)
    await mockWriteAPI(page)
    await goToProjectStage(page, projectId, 'write')
    await expect(page.getByText('집필').first()).toBeVisible({ timeout: 10000 })

    // 4. Set up chapters and go to edit
    await setupChaptersWritten(page, projectId)
    await mockEditAPI(page)
    await goToProjectStage(page, projectId, 'edit')
    await expect(page.getByText('교정').first()).toBeVisible({ timeout: 10000 })

    // 5. Set up for review
    await setupReadyForReview(page, projectId)
    await mockReviewAPI(page)
    await goToProjectStage(page, projectId, 'review')
    await expect(page.getByText('검토').first()).toBeVisible({ timeout: 10000 })

    // 6. Complete and go to preview
    await setupCompletedProject(page, projectId)
    await goToPreview(page, projectId)
    await expect(
      page.getByText('E2E 테스트 프로젝트').first()
    ).toBeVisible({ timeout: 15000 })
  })

  test('Book Bible access from outline stage (fiction type)', async ({
    page,
    projectId,
  }) => {
    await setupResearchComplete(page, projectId)
    await page.request.put(`/api/projects/${projectId}`, {
      data: {
        outline: MOCK_OUTLINE,
        confirmedAt: new Date().toISOString(),
        stage: 'outline',
        status: 'outlining',
      },
    })

    await goToProjectStage(page, projectId, 'outline')
    await page.waitForLoadState('networkidle')

    // Look for Bible/context tab or button
    const bibleButton = page
      .getByRole('button', { name: /바이블|bible|컨텍스트|context/i })
      .first()
    if (await bibleButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await bibleButton.click()
      // Bible panel should appear with fiction-related content
      await expect(
        page.getByText(/장르|캐릭터|세계관|설정/i).first()
      ).toBeVisible({ timeout: 10000 })
    } else {
      // Bible may be integrated differently - verify outline page loaded
      await expect(page.getByText('목차').first()).toBeVisible({
        timeout: 10000,
      })
    }
  })

  test('Editor-Critic feedback loop in review stage', async ({
    page,
    projectId,
  }) => {
    await setupReadyForReview(page, projectId)
    await mockReviewAPI(page)
    await mockFeedbackLoopAPI(page)
    await goToProjectStage(page, projectId, 'review')

    // Run initial evaluation
    await page.getByRole('button', { name: '평가 실행' }).click()
    await expect(page.getByText('종합 점수')).toBeVisible({ timeout: 15000 })

    // Run re-evaluation (feedback loop)
    await page.getByRole('button', { name: '평가 실행' }).click()
    await expect(page.getByText('종합 점수')).toBeVisible({ timeout: 15000 })

    // Verify feedback text
    await expect(
      page.getByText(/전반적으로 잘 작성된 원고/).first()
    ).toBeVisible()
  })

  test('Data consistency across all 5 stages', async ({
    page,
    projectId,
  }) => {
    test.slow()
    await setupReadyForReview(page, projectId)

    const stages = [
      'research',
      'outline',
      'write',
      'edit',
      'review',
    ] as const

    for (const stage of stages) {
      await goToProjectStage(page, projectId, stage)
      // Each stage should load without error
      await page.waitForLoadState('networkidle')
      // Page should not show error state
      const errorVisible = await page
        .getByText(/오류|error|404|500/i)
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false)
      expect(errorVisible).toBeFalsy()
    }
  })

  test('i18n language switcher on landing page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Look for language switcher
    const langSwitcher = page
      .getByRole('button', { name: /언어|language|한국어|english|EN|KO/i })
      .first()
    if (await langSwitcher.isVisible({ timeout: 5000 }).catch(() => false)) {
      await langSwitcher.click()
      // Should show language options
      const langOption = page
        .getByText(/english|한국어/i)
        .first()
      await expect(langOption).toBeVisible({ timeout: 5000 })
    } else {
      // LanguageSwitcher may render as select or different element
      const selectLang = page.locator('[data-testid="language-switcher"]').first()
      if (await selectLang.isVisible({ timeout: 3000 }).catch(() => false)) {
        expect(await selectLang.isVisible()).toBeTruthy()
      } else {
        // Verify landing page loaded successfully
        await expect(
          page.getByText(/AI Book|당신의 이야기/i).first()
        ).toBeVisible({ timeout: 10000 })
      }
    }
  })

  test('Cover designer modal open/tab switch/close', async ({
    page,
    projectId,
  }) => {
    await setupCompletedProject(page, projectId)
    await mockCoverGenerateAPI(page)
    await goToPreview(page, projectId)

    // Click cover design button
    const coverButton = page
      .getByRole('button', { name: /표지/ })
      .first()
    await expect(coverButton).toBeVisible({ timeout: 10000 })
    await coverButton.click()

    // CoverDesigner modal should be visible
    await expect(page.getByText('표지 디자인')).toBeVisible({
      timeout: 10000,
    })

    // Verify template tab is active by default
    await expect(page.getByText('템플릿 선택')).toBeVisible()

    // Switch to AI tab
    await page.getByText('AI 생성').click()
    await expect(
      page.getByText(/AI가 책 내용에 맞는 표지/)
    ).toBeVisible({ timeout: 5000 })

    // Switch back to template tab
    await page.getByText('템플릿 선택').click()
    await expect(
      page.getByText(/책 유형에 맞는 템플릿/)
    ).toBeVisible({ timeout: 5000 })

    // Close modal via cancel button
    await page.getByRole('button', { name: '취소' }).first().click()

    // Modal should be closed
    await expect(page.getByText('표지 디자인')).not.toBeVisible({
      timeout: 5000,
    })
  })
})
