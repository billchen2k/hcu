import argparse
from stat import filemode
from typing import List, Tuple
import pandas as pd
import re
import logging
import sys


logging_format = "[%(asctime)s] %(filename)s:%(lineno)d (%(levelname)s): %(message)s"
logging_format = "(%(levelname)s): %(message)s"
file_handler = logging.FileHandler(filename="logs/data_validator.log", mode="w")
stdout_handler = logging.StreamHandler(sys.stdout)
handlers = [file_handler, stdout_handler]
logging.basicConfig(
    format=logging_format, level=logging.ERROR, handlers=handlers,
)
logger = logging.getLogger(__name__)


# /((其他：(.+)$|复校$|撤销$|建校：(.+)$|更名：(.+)$|院校合并：与([^、]+、)*([^、]+)+合并成立(.+)$|院系(迁出|迁入)：([^-、]+-[^-、]+、)*([^-、]+-[^-、]+)并入(.+)$|建立(分校|校区)：在(.+)建立(.+)$|迁址：由(.+)迁往(.+)$|改建：(.+)改建为(.+)$))+/g


class Event:

    EVENT_CANCEL = "cancel"
    EVENT_RESTORE = "restore"
    EVENT_RENAME = "rename"
    EVENT_UNIVERSITY_MERGE = "university_merge"
    EVENT_INSTITUDE_MOVE_OUT = "institute_move_out"
    EVENT_INSTITUDE_MOVE_IN = "institute_move_in"
    EVENT_ESTABLISH_CAMPUSE = "establish_campus"
    EVENT_ESTABLISH_BRANCH = "establish_branch"
    EVENT_RELOCATION = "relocation"
    EVENT_RECONSTRUCT = "reconstruct"
    EVENT_UNKNOWN = "unknown"

    def __init__(
        self,
        year,
        month,
        universiy,
        original: str,
        type: str,
        src: List[str],
        dest: List[str],
        adverbial: str,
    ) -> None:
        self.year = year
        self.month = month
        self.university = universiy
        self.original = original
        self.type = type
        self.src = src
        self.dest = dest
        self.adverbial = adverbial


class Validator:
    def __init__(self, *args, **kwargs) -> None:
        self.data_path = kwargs.get("data_path")
        self.output_path = kwargs.get("output_path")
        self.data = pd.read_csv(self.data_path)

    def _get_university_history_list(self, name: str) -> List[Tuple[str, str]]:
        history = []
        events = list(zip(self.data["DATE"].round(2), self.data[name]))
        history = list(filter(lambda x: not pd.isna(x[1]), events))
        return history

    def _validate_address(self, address: str) -> bool:
        municipalities = ["北京市", "天津市", "上海市", "重庆市"]
        if address in municipalities:
            return True
        else:
            pattern = re.compile(r"^.+省.+市$")
            if pattern.match(address):
                return True
            else:
                return False

    def _validate_event(self, date: str, event: str):
        regexList = [
            re.compile(r"其他：(.+)$"),
            re.compile(r"复校$"),
            re.compile(r"撤销$"),
            re.compile(r"建立分校：在(?P<location>.+)建立(.+)$"),
            re.compile(r"建立校区：在(?P<location>.+)建立(.+)$"),
            re.compile(r"迁址：由(?P<location>.+)迁往(?P<location1>.+)$"),
            re.compile(r"改建：(.+)改建为(.+)$"),
            re.compile(r"院校合并：与([^、]+、)*([^、]+)合并成立(.+)$"),
            re.compile(r"院系迁出：([^-、]+-[^-、]+、)*([^-、]+-[^-、]+)并入(.+)$"),
            re.compile(r"院系迁入：([^-、]+-[^-、]+、)*([^-、]+-[^-、]+)并入(.+)$"),
            re.compile(r"建校：(.+)$"),
            re.compile(r"更名：(.+)$"),
        ]
        event = re.sub(r"[\n\r]+", "；", event)
        events = event.split("；")
        for e in events:
            event_good = False
            for regex in regexList:
                match = regex.search(e)
                if match:
                    logger.info(
                        f"[{self.current_university}, {date}, {e}]: Matches event {regex.pattern.split('：')[0]}"
                    )
                    event_good = True

                    # Address match check
                    if regex.pattern.find("迁址") != -1:
                        previous_location = self.current_university_location
                        event_previous_location = match.group(1)
                        if (
                            previous_location != "init"
                            and previous_location != event_previous_location
                        ):
                            logger.error(
                                f"[{self.current_university}, {date}, {e}]: Previous location {previous_location} and event previous location {event_previous_location} not match."
                            )
                        self.current_university_location = match.group(2)

                    # Address format check
                    if "location" in match.groupdict():
                        locations = [match.group("location")]
                        if "location1" in match.groupdict():
                            locations.append(match.group("location1"))
                        for loc in locations:
                            if not self._validate_address(loc):
                                logger.error(
                                    f"[{self.current_university}, {date}, {e}]: Location {loc} is not valid. （省市或直辖市）"
                                )
                        break

            if not event_good:
                logger.error(
                    f"[{self.current_university}, {date}, {e}]: Unknown event or incorrect format."
                )

    def validate(self) -> bool:
        logger.debug("Start validating...")
        self.universities = self.data.columns[1:]
        for university in self.universities:
            logger.debug(f"Validating {university}...")
            self.current_university = university
            self.current_university_location = "init"
            history = self._get_university_history_list(university)
            for history_item in history:
                date = history_item[0]
                event = history_item[1]
                self._validate_event(date, event)
        logger.debug("Finished validating.")
        return True


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--data",
        "-d",
        metavar="DATA",
        type=str,
        help="Path to the data file.",
        required=True,
    )
    parser.add_argument(
        "--output", "-o", metavar="OUTPUT", type=str, help="Path to the output file."
    )
    args = parser.parse_args()
    validator = Validator(data_path=args.data, output_path=args.output)
    validator.validate()


if __name__ == "__main__":
    main()
