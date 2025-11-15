type EvaluateFn = (selector: string) => Promise<unknown> | unknown;

class StubPage {
  async goto() {
    return true;
  }

  async $$eval(_selector: string, callback: EvaluateFn) {
    return callback('');
  }

  async close() {
    return true;
  }
}

class StubBrowser {
  async newPage() {
    return new StubPage();
  }

  async close() {
    return true;
  }
}

export const chromium = {
  async launch() {
    return new StubBrowser();
  },
};
