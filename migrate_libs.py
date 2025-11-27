#!/usr/bin/env python3
import os
import shutil
import subprocess
from pathlib import Path

BASE_DIR = Path("/home/ivan/git/workix")
LIBS_DIR = BASE_DIR / "libs"

# Create category directories
categories = {
    "domain": ["auth", "users", "pipelines", "rbac", "webhooks", "workflows", "workers"],
    "infrastructure": ["database", "prisma", "message-broker", "i18n", "notifications", "api-keys", "testing", "service-discovery", "performance"],
    "integrations": {
        "cloud": ["aws-integration", "azure-integration", "gcp-integration"],
        "code": ["github-integration", "gitlab-integration"],
        "communication": ["slack-integration", "telegram-integration"],
        "project-management": ["jira-integration", "salesforce-integration"],
        "core": ["integration-core"]
    },
    "ai": ["ai-core", "generation", "ml-integration"],
    "utilities": ["ab-testing", "billing", "batch-processing", "custom-scripts", "data-validation", "file-storage", "resilience"]
}

def migrate():
    print("🚀 Starting migration...")

    # Create domain directories
    for lib in categories["domain"]:
        src = LIBS_DIR / lib
        if src.exists():
            dst = LIBS_DIR / "domain" / lib
            dst.parent.mkdir(parents=True, exist_ok=True)
            print(f"Moving {lib} to domain/{lib}...")
            try:
                subprocess.run(["git", "mv", str(src), str(dst)], cwd=BASE_DIR, check=True)
                print(f"✅ Moved {lib}")
            except subprocess.CalledProcessError as e:
                print(f"❌ Failed to move {lib}: {e}")

    # Create infrastructure directories
    for lib in categories["infrastructure"]:
        src = LIBS_DIR / lib
        if src.exists():
            dst = LIBS_DIR / "infrastructure" / lib
            dst.parent.mkdir(parents=True, exist_ok=True)
            print(f"Moving {lib} to infrastructure/{lib}...")
            try:
                subprocess.run(["git", "mv", str(src), str(dst)], cwd=BASE_DIR, check=True)
                print(f"✅ Moved {lib}")
            except subprocess.CalledProcessError as e:
                print(f"❌ Failed to move {lib}: {e}")

    # Create integrations directories
    for category, libs in categories["integrations"].items():
        if category == "core":
            for lib in libs:
                src = LIBS_DIR / lib
                if src.exists():
                    dst = LIBS_DIR / "integrations" / "core"
                    dst.mkdir(parents=True, exist_ok=True)
                    print(f"Moving {lib} to integrations/core...")
                    try:
                        subprocess.run(["git", "mv", str(src), str(dst)], cwd=BASE_DIR, check=True)
                        print(f"✅ Moved {lib}")
                    except subprocess.CalledProcessError as e:
                        print(f"❌ Failed to move {lib}: {e}")
        else:
            for lib in libs:
                src = LIBS_DIR / lib
                if src.exists():
                    dst = LIBS_DIR / "integrations" / category / lib.replace("-integration", "")
                    dst.parent.mkdir(parents=True, exist_ok=True)
                    print(f"Moving {lib} to integrations/{category}/{lib.replace('-integration', '')}...")
                    try:
                        subprocess.run(["git", "mv", str(src), str(dst)], cwd=BASE_DIR, check=True)
                        print(f"✅ Moved {lib}")
                    except subprocess.CalledProcessError as e:
                        print(f"❌ Failed to move {lib}: {e}")

    # Create AI directories
    for lib in categories["ai"]:
        src = LIBS_DIR / lib
        if src.exists():
            dst = LIBS_DIR / "ai" / lib
            dst.parent.mkdir(parents=True, exist_ok=True)
            print(f"Moving {lib} to ai/{lib}...")
            try:
                subprocess.run(["git", "mv", str(src), str(dst)], cwd=BASE_DIR, check=True)
                print(f"✅ Moved {lib}")
            except subprocess.CalledProcessError as e:
                print(f"❌ Failed to move {lib}: {e}")

    # Create utilities directories
    for lib in categories["utilities"]:
        src = LIBS_DIR / lib
        if src.exists():
            dst = LIBS_DIR / "utilities" / lib
            dst.parent.mkdir(parents=True, exist_ok=True)
            print(f"Moving {lib} to utilities/{lib}...")
            try:
                subprocess.run(["git", "mv", str(src), str(dst)], cwd=BASE_DIR, check=True)
                print(f"✅ Moved {lib}")
            except subprocess.CalledProcessError as e:
                print(f"❌ Failed to move {lib}: {e}")

    print("✅ Migration complete!")

if __name__ == "__main__":
    migrate()
